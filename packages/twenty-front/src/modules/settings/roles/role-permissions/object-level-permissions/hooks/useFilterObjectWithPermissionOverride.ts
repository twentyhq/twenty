import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useGetObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useGetObjectPermissionDerivedStates';
import { useCallback } from 'react';

export const useFilterObjectMetadataItemsWithPermissionOverride = ({
  roleId,
}: {
  roleId: string;
}) => {
  const { getObjectPermissionDerivedStates } =
    useGetObjectPermissionDerivedStates({
      roleId,
    });

  const filterObjectMetadataItemsWithPermissionOverride = useCallback(
    (objectMetadataItem: EnrichedObjectMetadataItem) => {
      const {
        objectHasOverrideOnObjectPermissions,
        objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount,
        objectHasNoOverrideButRowLevelPermissionShouldBeTakenIntoAccount,
      } = getObjectPermissionDerivedStates(objectMetadataItem.id);

      const hasOverride =
        objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount ||
        objectHasNoOverrideButRowLevelPermissionShouldBeTakenIntoAccount ||
        objectHasOverrideOnObjectPermissions;

      return hasOverride;
    },
    [getObjectPermissionDerivedStates],
  );

  return {
    filterObjectMetadataItemsWithPermissionOverride,
  };
};
