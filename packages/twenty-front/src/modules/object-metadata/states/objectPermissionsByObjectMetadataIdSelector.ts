import { currentUserWorkspaceObjectsPermissionsSelector } from '@/auth/states/currentUserWorkspaceObjectsPermissionsSelector';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const objectPermissionsByObjectMetadataIdSelector =
  createAtomSelector<ObjectPermissionsByObjectMetadataId>({
    key: 'objectPermissionsByObjectMetadataIdSelector',
    areEqual: isDeeplyEqual,
    get: ({ get }) => {
      const objectsPermissions =
        get(currentUserWorkspaceObjectsPermissionsSelector) ?? [];

      return Object.fromEntries(
        objectsPermissions.map((objectPermissions) => {
          const defaultObjectPermissions = getDefaultObjectPermissions(
            objectPermissions.objectMetadataId,
          );

          return [
            objectPermissions.objectMetadataId,
            {
              objectMetadataId: objectPermissions.objectMetadataId,
              canReadObjectRecords:
                objectPermissions.canReadObjectRecords ??
                defaultObjectPermissions.canReadObjectRecords,
              canUpdateObjectRecords:
                objectPermissions.canUpdateObjectRecords ??
                defaultObjectPermissions.canUpdateObjectRecords,
              canSoftDeleteObjectRecords:
                objectPermissions.canSoftDeleteObjectRecords ??
                defaultObjectPermissions.canSoftDeleteObjectRecords,
              canDestroyObjectRecords:
                objectPermissions.canDestroyObjectRecords ??
                defaultObjectPermissions.canDestroyObjectRecords,
              restrictedFields:
                objectPermissions.restrictedFields ??
                defaultObjectPermissions.restrictedFields,
              rowLevelPermissionPredicates:
                objectPermissions.rowLevelPermissionPredicates ??
                defaultObjectPermissions.rowLevelPermissionPredicates,
              rowLevelPermissionPredicateGroups:
                objectPermissions.rowLevelPermissionPredicateGroups ??
                defaultObjectPermissions.rowLevelPermissionPredicateGroups,
            },
          ];
        }),
      );
    },
  });
