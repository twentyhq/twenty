import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isWorkflowRelatedObjectMetadata } from '@/object-metadata/utils/isWorkflowRelatedObjectMetadata';
import { useGetObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useGetObjectPermissionDerivedStates';
import { useCallback } from 'react';
import { ObjectPermission } from '~/generated/graphql';

export const useFilterObjectsWithPermissionOverride = ({
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

  const filterObjectsWithPermissionOverride = useCallback(
    (objectPermission: ObjectPermission) => {
      const {
        objectHasNoOverrideOnObjectPermission,
        thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt,
        thereAreFieldPermissionsOnlyButTheyShouldBeTakenIntoAccount,
      } = getObjectPermissionDerivedStates(objectPermission.objectMetadataId);

      const shouldBeTaken =
        thereAreFieldPermissionsOnlyButTheyShouldBeTakenIntoAccount ||
        (!objectHasNoOverrideOnObjectPermission &&
          !thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt &&
          !isWorkflowRelatedObjectMetadata(
            objectMetadataMap[objectPermission.objectMetadataId]?.nameSingular,
          ));

      return shouldBeTaken;
    },
    [getObjectPermissionDerivedStates, objectMetadataMap],
  );

  return {
    filterObjectsWithPermissionOverride,
  };
};
