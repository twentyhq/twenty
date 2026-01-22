/* @license Enterprise */

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { convertPredicateToRecordFilter } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';
import { buildCompositeValueFromSubField } from '@/object-record/record-table/utils/buildValueFromFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { RelationType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const mergeCompositeValues = (
  existingValue: unknown,
  incomingValue: unknown,
) =>
  isPlainObject(existingValue) && isPlainObject(incomingValue)
    ? { ...existingValue, ...incomingValue }
    : incomingValue;

export const useBuildRecordInputFromRLSPredicates = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { record: currentWorkspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
  });

  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  const getRecordInputFieldName = (fieldMetadataItem: {
    name: string;
    type: string;
    settings?: { relationType?: RelationType };
  }) =>
    fieldMetadataItem.type === 'RELATION' &&
    fieldMetadataItem.settings?.relationType === RelationType.MANY_TO_ONE
      ? `${fieldMetadataItem.name}Id`
      : fieldMetadataItem.name;

  const getWorkspaceMemberFieldValue = ({
    workspaceMemberFieldMetadataId,
    workspaceMemberSubFieldName,
  }: {
    workspaceMemberFieldMetadataId?: string | null;
    workspaceMemberSubFieldName?: string | null;
  }) => {
    const workspaceMemberFieldMetadataItem =
      workspaceMemberObjectMetadataItem?.fields.find(
        (field) => field.id === workspaceMemberFieldMetadataId,
      );

    if (!isDefined(workspaceMemberFieldMetadataItem)) {
      throw new Error(
        `Workspace member field metadata item not found for id: ${workspaceMemberFieldMetadataId}`,
      );
    }

    let workspaceMemberFieldValue =
      currentWorkspaceMemberRecord?.[workspaceMemberFieldMetadataItem.name];

    if (isCompositeFieldType(workspaceMemberFieldMetadataItem.type)) {
      if (!workspaceMemberSubFieldName) {
        throw new Error(
          `Workspace member subfield name not found for field: ${workspaceMemberFieldMetadataItem.name}`,
        );
      }

      const compositeValue = workspaceMemberFieldValue as
        | Record<string, unknown>
        | undefined;
      workspaceMemberFieldValue = compositeValue?.[workspaceMemberSubFieldName];
    }

    if (isUndefined(workspaceMemberFieldValue)) {
      throw new Error(
        `Current workspace member field value not found for field: ${workspaceMemberFieldMetadataItem.name}`,
      );
    }

    return workspaceMemberFieldValue;
  };

  const buildRecordInputFromRLSPredicates = (): Partial<ObjectRecord> => {
    const rlsPredicates = objectPermissions.rowLevelPermissionPredicates.filter(
      (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
    );

    const fieldMetadataItemMap = new Map(
      objectMetadataItem.fields.map((field) => [field.id, field]),
    );

    const rlsPredicatesAsRecordFilters = rlsPredicates
      .map((predicate) =>
        convertPredicateToRecordFilter(
          predicate,
          fieldMetadataItemMap.get(predicate.fieldMetadataId),
        ),
      )
      .filter(isDefined);

    const recordInputFromDynamicFilters: Partial<ObjectRecord> = {};

    rlsPredicatesAsRecordFilters.forEach((filter) => {
      const fieldMetadataItem = fieldMetadataItemMap.get(
        filter.fieldMetadataId,
      );

      if (!isDefined(fieldMetadataItem)) {
        return;
      }

      if (isDefined(filter.rlsDynamicValue)) {
        const recordInputField = getRecordInputFieldName(fieldMetadataItem);
        const currentWorkspaceMemberFieldValue = getWorkspaceMemberFieldValue({
          workspaceMemberFieldMetadataId:
            filter.rlsDynamicValue?.workspaceMemberFieldMetadataId,
          workspaceMemberSubFieldName:
            filter.rlsDynamicValue?.workspaceMemberSubFieldName,
        });

        if (isCompositeFieldType(fieldMetadataItem.type)) {
          if (!filter.subFieldName) {
            throw new Error(
              `Subfield name not found for composite field: ${fieldMetadataItem.name}`,
            );
          }

          const compositeValue = buildCompositeValueFromSubField({
            compositeFieldType: fieldMetadataItem.type,
            subFieldName: filter.subFieldName,
            value: currentWorkspaceMemberFieldValue,
          });

          if (!compositeValue) {
            throw new Error(
              `Composite subfield not found for field: ${fieldMetadataItem.name}`,
            );
          }

          recordInputFromDynamicFilters[recordInputField] =
            mergeCompositeValues(
              recordInputFromDynamicFilters[recordInputField],
              compositeValue,
            );
        } else {
          recordInputFromDynamicFilters[recordInputField] =
            currentWorkspaceMemberFieldValue;
        }
      }
    });

    // Only process filters without rlsDynamicValue in buildRecordInputFromFilter
    // Filters with rlsDynamicValue are already handled above
    const staticFilters = rlsPredicatesAsRecordFilters.filter(
      (filter) => !isDefined(filter.rlsDynamicValue),
    );

    const recordInputFromStaticFilters = buildRecordInputFromFilter({
      currentRecordFilters: staticFilters,
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
    });

    const mergedRecordInput: Partial<ObjectRecord> = {
      ...recordInputFromDynamicFilters,
    };

    Object.entries(recordInputFromStaticFilters).forEach(([key, value]) => {
      mergedRecordInput[key] = mergeCompositeValues(
        mergedRecordInput[key],
        value,
      );
    });

    return mergedRecordInput;
  };

  return { buildRecordInputFromRLSPredicates };
};
