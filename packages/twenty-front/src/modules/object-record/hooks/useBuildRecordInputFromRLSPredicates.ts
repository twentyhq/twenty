/* @license Enterprise */

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { convertPredicateToRecordFilter } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import {
  CoreObjectNameSingular,
  FieldMetadataType,
  RelationType,
  RowLevelPermissionPredicateScope,
} from 'twenty-shared/types';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';
import { buildCompositeValueFromSubField } from '@/object-record/record-table/utils/buildValueFromFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefined } from '@sniptt/guards';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
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
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

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

  const { objectMetadataItems } = useObjectMetadataItems();

  const writeScopedRlsPredicates = useMemo(
    () =>
      objectPermissions.rowLevelPermissionPredicates.filter(
        (predicate) =>
          predicate.objectMetadataId === objectMetadataItem.id &&
          (predicate.scope === RowLevelPermissionPredicateScope.ALL ||
            predicate.scope === RowLevelPermissionPredicateScope.WRITE ||
            !isDefined(predicate.scope)),
      ),
    [objectMetadataItem.id, objectPermissions.rowLevelPermissionPredicates],
  );

  // Detect indirect relation: when an RLS predicate's workspaceMemberFieldMetadataId
  // needs to resolve through an intermediate object (e.g. Policy.agent ->
  // AgentProfile.workspaceMember) instead of using the raw workspaceMember id.
  const intermediateObjectInfo = useMemo(() => {
    for (const predicate of writeScopedRlsPredicates) {
      const wmFieldId = predicate.workspaceMemberFieldMetadataId;

      if (!wmFieldId) {
        continue;
      }

      const predicateFieldMetadataItem = objectMetadataItem.fields.find(
        (field) => field.id === predicate.fieldMetadataId,
      );

      const isOnWorkspaceMember =
        workspaceMemberObjectMetadataItem?.fields.some(
          (field) => field.id === wmFieldId,
        );

      if (
        isDefined(predicateFieldMetadataItem) &&
        predicateFieldMetadataItem.type === FieldMetadataType.RELATION
      ) {
        const relationTargetObjectNameSingular =
          predicateFieldMetadataItem.relation?.targetObjectMetadata
            .nameSingular;

        if (
          isDefined(relationTargetObjectNameSingular) &&
          relationTargetObjectNameSingular !==
            CoreObjectNameSingular.WorkspaceMember
        ) {
          const relationTargetObjectMetadataItem = objectMetadataItems.find(
            (item) => item.nameSingular === relationTargetObjectNameSingular,
          );
          const relationToWorkspaceMemberField =
            relationTargetObjectMetadataItem?.fields.find(
              (field) =>
                field.type === FieldMetadataType.RELATION &&
                field.relation?.targetObjectMetadata.nameSingular ===
                  CoreObjectNameSingular.WorkspaceMember,
            );

          if (isDefined(relationToWorkspaceMemberField)) {
            return {
              objectNameSingular: relationTargetObjectNameSingular,
              relationFieldName: relationToWorkspaceMemberField.name,
            };
          }
        }
      }

      if (!isOnWorkspaceMember) {
        for (const obj of objectMetadataItems) {
          const field = obj.fields.find((f) => f.id === wmFieldId);

          if (isDefined(field)) {
            return {
              objectNameSingular: obj.nameSingular,
              relationFieldName: field.name,
            };
          }
        }
      }
    }

    return null;
  }, [
    objectMetadataItems,
    objectMetadataItem.fields,
    workspaceMemberObjectMetadataItem,
    writeScopedRlsPredicates,
  ]);

  // Pre-fetch intermediate object record for the current user
  // (e.g., find the Agent record where workspaceMemberId = current user)
  const { records: intermediateRecords } = useFindManyRecords({
    objectNameSingular:
      intermediateObjectInfo?.objectNameSingular ??
      CoreObjectNameSingular.WorkspaceMember,
    filter: intermediateObjectInfo
      ? {
          [`${intermediateObjectInfo.relationFieldName}Id`]: {
            eq: currentWorkspaceMember?.id,
          },
        }
      : undefined,
    skip: !intermediateObjectInfo || !currentWorkspaceMember?.id,
    limit: 1,
  });

  const intermediateRecordId =
    intermediateRecords.length > 0 ? intermediateRecords[0].id : undefined;

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
    fieldMetadataItem,
    workspaceMemberFieldMetadataId,
    workspaceMemberSubFieldName,
  }: {
    fieldMetadataItem: EnrichedObjectMetadataItem['fields'][number];
    workspaceMemberFieldMetadataId?: string | null;
    workspaceMemberSubFieldName?: string | null;
  }) => {
    const workspaceMemberFieldMetadataItem =
      workspaceMemberObjectMetadataItem?.fields.find(
        (field) => field.id === workspaceMemberFieldMetadataId,
      );

    if (!isDefined(workspaceMemberFieldMetadataItem)) {
      // Indirect relation: field is on an intermediate object (e.g., Agent)
      // that has a relation to WorkspaceMember. Return the pre-fetched
      // intermediate record ID so it can be used as the pre-fill value.
      if (isDefined(intermediateRecordId)) {
        return intermediateRecordId;
      }

      // Field metadata not found — may be stale RLS predicate referencing
      // a removed field. Skip gracefully; the server-side hook will set
      // the correct value with bypassed permissions.
      return undefined;
    }

    if (
      fieldMetadataItem.type === FieldMetadataType.RELATION &&
      workspaceMemberFieldMetadataItem.name === 'id' &&
      fieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
        intermediateObjectInfo?.objectNameSingular &&
      isDefined(intermediateRecordId)
    ) {
      return intermediateRecordId;
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

  const buildRecordInputFromRLSPredicates = (
    options?: { includeRestrictedFields?: boolean },
  ): Partial<ObjectRecord> => {
    const fieldMetadataItemMap = new Map(
      objectMetadataItem.fields.map((field) => [field.id, field]),
    );

    const rlsPredicatesAsRecordFilters = writeScopedRlsPredicates
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
        // Skip fields the user can't edit — the server-side post-query
        // hook will set them with bypassed permissions instead.
        const fieldRestriction =
          objectPermissions.restrictedFields[fieldMetadataItem.id];

        if (
          fieldRestriction?.canUpdate === false &&
          !options?.includeRestrictedFields
        ) {
          return;
        }

        const recordInputField = getRecordInputFieldName(fieldMetadataItem);
        const currentWorkspaceMemberFieldValue = getWorkspaceMemberFieldValue({
          fieldMetadataItem,
          workspaceMemberFieldMetadataId:
            filter.rlsDynamicValue?.workspaceMemberFieldMetadataId,
          workspaceMemberSubFieldName:
            filter.rlsDynamicValue?.workspaceMemberSubFieldName,
        });

        // Skip if the value couldn't be resolved (e.g., no Agent profile)
        if (isUndefined(currentWorkspaceMemberFieldValue)) {
          return;
        }

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
