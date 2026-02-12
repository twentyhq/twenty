import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/utils/recordIdentifierToObjectRecordIdentifier';
import { sortNavigationMenuItems } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';

type NavigationMenuItemFolder = {
  id: string;
  folderName: string;
  navigationMenuItems: ReturnType<typeof sortNavigationMenuItems>[number][];
};

export const useNavigationMenuItemsByFolder = () => {
  const coreViews = useRecoilValue(coreViewsState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();

  const views = coreViews.map(convertCoreViewToView);

  const allNavigationMenuItems = [
    ...workspaceNavigationMenuItems,
    ...navigationMenuItems,
  ];

  const { workspaceFolders, userFolders, itemsByFolderId } =
    allNavigationMenuItems.reduce<{
      workspaceFolders: Array<{ id: string; name: string }>;
      userFolders: Array<{ id: string; name: string }>;
      itemsByFolderId: Map<string, NavigationMenuItem[]>;
    }>(
      (acc, item) => {
        if (isNavigationMenuItemFolder(item)) {
          const folderEntry = { id: item.id, name: item.name || 'Folder' };
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

  const buildFoldersList = (folders: Array<{ id: string; name: string }>) => {
    const sortedFolders = [...folders].sort((a, b) => {
      const folderA = allNavigationMenuItems.find((item) => item.id === a.id);
      const folderB = allNavigationMenuItems.find((item) => item.id === b.id);
      const positionA = folderA?.position ?? 0;
      const positionB = folderB?.position ?? 0;
      return positionA - positionB;
    });

    return sortedFolders.reduce<NavigationMenuItemFolder[]>((acc, folder) => {
      const itemsInFolder = itemsByFolderId.get(folder.id) || [];

      const targetRecordIdentifiersMap = itemsInFolder.reduce<
        Map<string, ObjectRecordIdentifier>
      >((map, item) => {
        const itemTargetRecordId = item.targetRecordId;
        if (!isDefined(itemTargetRecordId) || isDefined(item.viewId)) {
          return map;
        }

        const targetRecordIdentifier = item.targetRecordIdentifier;

        if (!isDefined(targetRecordIdentifier)) {
          return map;
        }

        const itemObjectMetadata = objectMetadataItems.find(
          (meta) => meta.id === item.targetObjectMetadataId,
        );

        if (isDefined(itemObjectMetadata)) {
          const objectRecordIdentifier =
            recordIdentifierToObjectRecordIdentifier({
              recordIdentifier: targetRecordIdentifier,
              objectMetadataItem: itemObjectMetadata,
            });

          map.set(itemTargetRecordId, objectRecordIdentifier);
        }

        return map;
      }, new Map());

      const sortedItems = sortNavigationMenuItems(
        itemsInFolder,
        true,
        views,
        objectMetadataItems,
        targetRecordIdentifiersMap,
      );

      acc.push({
        id: folder.id,
        folderName: folder.name,
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
