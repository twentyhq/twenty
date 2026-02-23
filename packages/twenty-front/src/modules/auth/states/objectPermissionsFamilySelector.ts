import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';

export const objectPermissionsFamilySelector = createFamilySelectorV2<
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

      const objectPermissions = currentUserWorkspace?.objectsPermissions?.find(
        (permission) => permission.objectMetadataId === objectMetadataItem.id,
      );

      return {
        canRead: objectPermissions?.canReadObjectRecords ?? false,
        canUpdate: objectPermissions?.canUpdateObjectRecords ?? false,
      };
    },
});
