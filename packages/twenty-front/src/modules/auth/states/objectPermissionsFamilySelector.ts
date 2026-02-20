import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { selectorFamily } from 'recoil';

// Temporary bridge: reads from Jotai store for migrated state.
// Will be fully migrated to Jotai in PR 6.
export const objectPermissionsFamilySelector = selectorFamily<
  {
    canRead: boolean;
    canUpdate: boolean;
  },
  { objectNameSingular: string }
>({
  key: 'objectPermissionsFamilySelector',
  get:
    ({ objectNameSingular }) =>
    ({ get }) => {
      const currentUserWorkspace = jotaiStore.get(
        currentUserWorkspaceState.atom,
      );
      const objectMetadataItems = get(objectMetadataItemsState);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === objectNameSingular,
      );

      if (!objectMetadataItem) {
        return {
          canRead: false,
          canUpdate: false,
        };
      }

      const objectPermissions = currentUserWorkspace?.objectsPermissions?.find(
        (permission) => permission.objectMetadataId === objectMetadataItem.id,
      );

      return {
        canRead: objectPermissions?.canReadObjectRecords ?? false,
        canUpdate: objectPermissions?.canUpdateObjectRecords ?? false,
      };
    },
});
