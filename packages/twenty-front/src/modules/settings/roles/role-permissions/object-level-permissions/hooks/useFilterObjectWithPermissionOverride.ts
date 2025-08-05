import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
    (objectMetadataItem: ObjectMetadataItem) => {
      const {
        objectHasOverrideOnObjectPermissions,
        objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount,
      } = getObjectPermissionDerivedStates(objectMetadataItem.id);

      const hasOverride =
        objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount ||
        objectHasOverrideOnObjectPermissions;

      return hasOverride;
    },
    [getObjectPermissionDerivedStates],
  );

  return {
    filterObjectMetadataItemsWithPermissionOverride,
  };
};
