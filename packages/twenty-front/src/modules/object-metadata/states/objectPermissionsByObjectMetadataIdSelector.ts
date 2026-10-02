import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const objectPermissionsByObjectMetadataIdSelector =
  createAtomSelector<ObjectPermissionsByObjectMetadataId>({
    key: 'objectPermissionsByObjectMetadataIdSelector',
    areEqual: isDeeplyEqual,
    get: ({ get }) => {
      const objectsPermissions =
        get(currentUserWorkspaceState)?.objectsPermissions ?? [];

      // The GraphQL fields are nullable, so a missing flag gets the same allow default as a missing object
      return Object.fromEntries(
        objectsPermissions.map((objectPermissions) => [
          objectPermissions.objectMetadataId,
          {
            objectMetadataId: objectPermissions.objectMetadataId,
            canReadObjectRecords:
              objectPermissions.canReadObjectRecords ?? true,
            canUpdateObjectRecords:
              objectPermissions.canUpdateObjectRecords ?? true,
            canSoftDeleteObjectRecords:
              objectPermissions.canSoftDeleteObjectRecords ?? true,
            canDestroyObjectRecords:
              objectPermissions.canDestroyObjectRecords ?? true,
            restrictedFields: objectPermissions.restrictedFields ?? {},
            rowLevelPermissionPredicates:
              objectPermissions.rowLevelPermissionPredicates ?? [],
            rowLevelPermissionPredicateGroups:
              objectPermissions.rowLevelPermissionPredicateGroups ?? [],
          },
        ]),
      );
    },
  });
