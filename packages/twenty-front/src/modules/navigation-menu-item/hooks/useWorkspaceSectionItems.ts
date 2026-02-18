import { useRecoilValue } from 'recoil';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { isDefined } from 'twenty-shared/utils';

import { useNavigationMenuItemsByFolder } from './useNavigationMenuItemsByFolder';
import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from './useSortedNavigationMenuItems';

export type FlatWorkspaceItem =
  | ProcessedNavigationMenuItem
  | (NavigationMenuItem & {
      itemType: NavigationMenuItemType.FOLDER;
      Icon: string;
    });

export type NavigationMenuItemClickParams = {
  item: FlatWorkspaceItem;
  objectMetadataItem?: ObjectMetadataItem | null;
};

export const useWorkspaceSectionItems = (): FlatWorkspaceItem[] => {
  const { workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();
  const coreViews = useRecoilValue(coreViewsState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const views = coreViews.map(convertCoreViewToView);

  const flatWorkspaceItems = workspaceNavigationMenuItems
    .filter((item) => !isDefined(item.folderId))
    .sort((a, b) => a.position - b.position);

  const processedObjectViewsById = new Map(
    workspaceNavigationMenuItemsSorted.map((item) => [item.id, item]),
  );

  const folderChildrenById = new Map(
    workspaceNavigationMenuItemsByFolder.map((folder) => [
      folder.id,
      folder.navigationMenuItems,
    ]),
  );

  const flatItems: FlatWorkspaceItem[] = flatWorkspaceItems.reduce<
    FlatWorkspaceItem[]
  >((acc, item) => {
    if (isNavigationMenuItemFolder(item)) {
      acc.push({
        ...item,
        itemType: NavigationMenuItemType.FOLDER,
        Icon: item.icon ?? FOLDER_ICON_DEFAULT,
      });
    } else {
      const processedItem = processedObjectViewsById.get(item.id);
      if (!isDefined(processedItem)) {
        return acc;
      }
      if (processedItem.itemType === NavigationMenuItemType.LINK) {
        acc.push(processedItem);
      } else {
        const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
          processedItem,
          objectMetadataItems,
          views,
        );
        if (isDefined(objectMetadataItem)) {
          acc.push(processedItem);
        }
      }
    }
    return acc;
  }, []);

  return flatItems.flatMap((item) =>
    item.itemType === NavigationMenuItemType.FOLDER
      ? [item, ...(folderChildrenById.get(item.id) ?? [])]
      : [item],
  );
};
