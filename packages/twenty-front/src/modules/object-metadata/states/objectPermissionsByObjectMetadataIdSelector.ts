import { currentUserWorkspaceObjectRecordsPermissionsSelector } from '@/auth/states/currentUserWorkspaceObjectRecordsPermissionsSelector';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const objectPermissionsByObjectMetadataIdSelector =
  createAtomSelector<ObjectPermissionsByObjectMetadataId>({
    key: 'objectPermissionsByObjectMetadataIdSelector',
    areEqual: isDeeplyEqual,
    get: ({ get }) => {
      const allObjectRecordsPermissions =
        get(currentUserWorkspaceObjectRecordsPermissionsSelector) ?? [];

      return Object.fromEntries(
        allObjectRecordsPermissions.map((objectRecordsPermissions) => [
          objectRecordsPermissions.objectMetadataId,
          {
            canCreateAllRecords: objectRecordsPermissions.canCreateAllRecords,
            canReadAllRecords: objectRecordsPermissions.canReadAllRecords,
            canUpdateAllRecords: objectRecordsPermissions.canUpdateAllRecords,
            canSoftDeleteAllRecords:
              objectRecordsPermissions.canSoftDeleteAllRecords,
            canDestroyAllRecords: objectRecordsPermissions.canDestroyAllRecords,
            unreadableFields: objectRecordsPermissions.unreadableFields,
            uneditableFields: objectRecordsPermissions.uneditableFields,
            rowLevelRecordsPermissions:
              objectRecordsPermissions.rowLevelRecordsPermissions,
          },
        ]),
      );
    },
  });
