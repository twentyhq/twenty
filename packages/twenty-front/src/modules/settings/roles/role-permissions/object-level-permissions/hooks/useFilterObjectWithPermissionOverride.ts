import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isWorkflowRelatedObjectMetadata } from '@/object-metadata/utils/isWorkflowRelatedObjectMetadata';
import { useGetObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useGetObjectPermissionDerivedStates';
import { useCallback } from 'react';

export const useFilterObjectMetadataItemsWithPermissionOverride = ({
  roleId,
}: {
  roleId: string;
}) => {
  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const filteredObjectMetadataItems = objectMetadataItems.filter(
    (item) => !isWorkflowRelatedObjectMetadata(item.nameSingular),
  );

  const objectMetadataMap = filteredObjectMetadataItems.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<string, ObjectMetadataItem>,
  );

  const { getObjectPermissionDerivedStates } =
    useGetObjectPermissionDerivedStates({
      roleId,
    });

  const filterObjectMetadataItemsWithPermissionOverride = useCallback(
    (objectMetadataItem: ObjectMetadataItem) => {
      const {
        objectHasNoOverrideOnObjectPermission,
        thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt,
        thereAreFieldPermissionsOnlyButTheyShouldBeTakenIntoAccount,
      } = getObjectPermissionDerivedStates(objectMetadataItem.id);

      const shouldBeTaken =
        thereAreFieldPermissionsOnlyButTheyShouldBeTakenIntoAccount ||
        (!objectHasNoOverrideOnObjectPermission &&
          !thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt &&
          !isWorkflowRelatedObjectMetadata(
            objectMetadataMap[objectMetadataItem.id]?.nameSingular,
          ));

      return shouldBeTaken;
    },
    [getObjectPermissionDerivedStates, objectMetadataMap],
  );

  return {
    filterObjectMetadataItemsWithPermissionOverride,
  };
};
