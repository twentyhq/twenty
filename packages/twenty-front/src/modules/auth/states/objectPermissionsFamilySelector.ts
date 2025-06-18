import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { selectorFamily } from 'recoil';

export const objectPermissionsFamilySelector = selectorFamily<
  {
    canRead: boolean;
  },
  { objectNameSingular: string }
>({
  key: 'objectPermissionsFamilySelector',
  get:
    ({ objectNameSingular }) =>
    ({ get }) => {
      const currentUserWorkspace = get(currentUserWorkspaceState);
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

      const objectPermissions = currentUserWorkspace?.objectPermissions?.find(
        (permission) => permission.objectMetadataId === objectMetadataItem.id,
      );

      return {
        canRead: objectPermissions?.canReadObjectRecords ?? false,
      };
    },
});
