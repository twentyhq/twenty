import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

type NavigationMenuItemFolder = {
  id: string;
  folderName: string;
  icon?: string | null;
  color?: string | null;
  navigationMenuItems: NavigationMenuItem[];
};

type NavigationMenuItemFolderEntry = Pick<
  NavigationMenuItemFolder,
  'id' | 'folderName' | 'icon' | 'color'
>;

export const useNavigationMenuItemsByFolder = () => {
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const allNavigationMenuItems = [
    ...workspaceNavigationMenuItems,
    ...navigationMenuItems,
  ];

  const { workspaceFolders, userFolders, itemsByFolderId } =
    allNavigationMenuItems.reduce<{
      workspaceFolders: NavigationMenuItemFolderEntry[];
      userFolders: NavigationMenuItemFolderEntry[];
      itemsByFolderId: Map<string, NavigationMenuItem[]>;
    }>(
      (acc, item) => {
        if (isNavigationMenuItemFolder(item)) {
          const folderEntry: NavigationMenuItemFolderEntry = {
            id: item.id,
            folderName: item.name || 'Folder',
            icon: item.icon ?? undefined,
            color: item.color ?? undefined,
          };
          if (isDefined(item.userWorkspaceId)) {
            acc.userFolders.push(folderEntry);
          } else {
            acc.workspaceFolders.push(folderEntry);
          }
        } else if (isDefined(item.folderId)) {
          const existingItems = acc.itemsByFolderId.get(item.folderId);
          if (isDefined(existingItems)) {
            existingItems.push(item);
          } else {
            acc.itemsByFolderId.set(item.folderId, [item]);
          }
        }

        return acc;
      },
      {
        workspaceFolders: [],
        userFolders: [],
        itemsByFolderId: new Map(),
      },
    );

  const buildFoldersList = (folders: NavigationMenuItemFolderEntry[]) => {
    const sortedFolders = [...folders].sort((a, b) => {
      const folderA = allNavigationMenuItems.find((item) => item.id === a.id);
      const folderB = allNavigationMenuItems.find((item) => item.id === b.id);
      const positionA = folderA?.position ?? 0;
      const positionB = folderB?.position ?? 0;
      return positionA - positionB;
    });

    return sortedFolders.reduce<NavigationMenuItemFolder[]>((acc, folder) => {
      const itemsInFolder = itemsByFolderId.get(folder.id) || [];

      const sortedItems = filterAndSortNavigationMenuItems(
        itemsInFolder,
        views,
        objectMetadataItems,
      );

      acc.push({
        id: folder.id,
        folderName: folder.folderName,
        icon: folder.icon,
        color: folder.color,
        navigationMenuItems: sortedItems,
      });

      return acc;
    }, []);
  };

  const workspaceNavigationMenuItemsByFolder =
    buildFoldersList(workspaceFolders);
  const userNavigationMenuItemsByFolder = buildFoldersList(userFolders);
  const navigationMenuItemsByFolder = [
    ...workspaceNavigationMenuItemsByFolder,
    ...userNavigationMenuItemsByFolder,
  ];

  return {
    navigationMenuItemsByFolder,
    workspaceNavigationMenuItemsByFolder,
    userNavigationMenuItemsByFolder,
  };
};
