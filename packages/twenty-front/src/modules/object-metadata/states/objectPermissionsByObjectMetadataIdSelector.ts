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
        allObjectRecordsPermissions.map((objectRecordsPermissions) => {
          const rowLevelRecordsPermissions =
            objectRecordsPermissions.rowLevelRecordsPermissions;

          return [
            objectRecordsPermissions.objectMetadataId,
            {
              objectMetadataId: objectRecordsPermissions.objectMetadataId,
              canReadAllRecords: objectRecordsPermissions.canReadAllRecords,
              canUpdateAllRecords: objectRecordsPermissions.canUpdateAllRecords,
              canSoftDeleteAllRecords:
                objectRecordsPermissions.canSoftDeleteAllRecords,
              canDestroyAllRecords:
                objectRecordsPermissions.canDestroyAllRecords,
              canReadSomeRecords:
                objectRecordsPermissions.canReadAllRecords ||
                (rowLevelRecordsPermissions?.canReadRecords ?? false),
              canUpdateSomeRecords:
                objectRecordsPermissions.canUpdateAllRecords ||
                (rowLevelRecordsPermissions?.canUpdateRecords ?? false),
              canSoftDeleteSomeRecords:
                objectRecordsPermissions.canSoftDeleteAllRecords ||
                (rowLevelRecordsPermissions?.canSoftDeleteRecords ?? false),
              canDestroySomeRecords:
                objectRecordsPermissions.canDestroyAllRecords ||
                (rowLevelRecordsPermissions?.canDestroyRecords ?? false),
              restrictedFields: objectRecordsPermissions.restrictedFields,
              rowLevelRecordsPermissions: rowLevelRecordsPermissions ?? null,
            },
          ];
        }),
      );
    },
  });
