import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { isDefined } from 'twenty-shared/utils';

import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from './useSortedNavigationMenuItems';

export type NavigationMenuItemClickParams = {
  item: NavigationMenuItem;
  objectMetadataItem?: ObjectMetadataItem | null;
};

export const useWorkspaceSectionItems = (): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const flatWorkspaceItems = workspaceNavigationMenuItems
    .filter((item) => !isDefined(item.folderId))
    .sort((a, b) => a.position - b.position);

  const processedItemsById = new Map(
    workspaceNavigationMenuItemsSorted.map((item) => [item.id, item]),
  );

  const folderChildrenById = new Map(
    workspaceNavigationMenuItemsByFolder.map((folder) => [
      folder.id,
      folder.navigationMenuItems,
    ]),
  );

  const flatItems: NavigationMenuItem[] = flatWorkspaceItems.reduce<
    NavigationMenuItem[]
  >((acc, item) => {
    if (isNavigationMenuItemFolder(item)) {
      acc.push({
        ...item,
        icon: item.icon ?? FOLDER_ICON_DEFAULT,
      });
    } else {
      const validItem = processedItemsById.get(item.id);
      if (!isDefined(validItem)) {
        return acc;
      }
      if (validItem.type === NavigationMenuItemType.LINK) {
        acc.push(validItem);
      } else {
        const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
          validItem,
          objectMetadataItems,
          views,
        );
        if (
          isDefined(objectMetadataItem) &&
          getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            objectMetadataItem.id,
          ).canReadObjectRecords
        ) {
          acc.push(validItem);
        }
      }
    }
    return acc;
  }, []);

  return flatItems.flatMap((item) =>
    item.type === NavigationMenuItemType.FOLDER
      ? [item, ...(folderChildrenById.get(item.id) ?? [])]
      : [item],
  );
};
