import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { convertPredicateToRecordFilter } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useBuildRecordInputFromRLSPredicates = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  const buildRecordInputFromRLSPredicates = (): Partial<ObjectRecord> => {
    const recordInput: Partial<ObjectRecord> = {};

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

    rlsPredicatesAsRecordFilters.forEach((filter) => {
      const fieldMetadataItem = fieldMetadataItemMap.get(
        filter.fieldMetadataId,
      );

      if (!isDefined(fieldMetadataItem)) {
        return;
      }

      if (isDefined(filter.rlsDynamicValue)) {
        const workspaceMemberFieldMetadataItem =
          workspaceMemberObjectMetadataItem?.fields.find(
            (field) =>
              field.id ===
              filter.rlsDynamicValue?.workspaceMemberFieldMetadataId,
          );

        if (!isDefined(workspaceMemberFieldMetadataItem)) {
          throw new Error(
            `Workspace member field metadata item not found for id: ${filter.rlsDynamicValue?.workspaceMemberFieldMetadataId}`,
          );
        }

        const recordInputField =
          fieldMetadataItem.type === 'RELATION'
            ? `${fieldMetadataItem.name}Id`
            : fieldMetadataItem.name;

        const currentWorkspaceMemberFieldValue =
          currentWorkspaceMember?.[
            workspaceMemberFieldMetadataItem.name as keyof typeof currentWorkspaceMember
          ];

        if (isUndefined(currentWorkspaceMemberFieldValue)) {
          throw new Error(
            `Current workspace member field value not found for field: ${workspaceMemberFieldMetadataItem.name}`,
          );
        }

        recordInput[recordInputField] = currentWorkspaceMemberFieldValue;
      }
    });

    const recordInputFromFilters = buildRecordInputFromFilter({
      currentRecordFilters: rlsPredicatesAsRecordFilters,
      objectMetadataItem,
      currentWorkspaceMember: currentWorkspaceMember ?? undefined,
    });

    return {
      ...recordInput,
      ...recordInputFromFilters,
    };
  };

  return { buildRecordInputFromRLSPredicates };
};
