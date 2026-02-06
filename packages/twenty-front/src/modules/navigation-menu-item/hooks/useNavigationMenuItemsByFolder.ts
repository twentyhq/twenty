import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/utils/recordIdentifierToObjectRecordIdentifier';
import { sortNavigationMenuItems } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';

type NavigationMenuItemFolder = {
  folderId: string;
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
    ...navigationMenuItems,
    ...workspaceNavigationMenuItems,
  ];

  const { folders, itemsByFolderId } = allNavigationMenuItems.reduce<{
    folders: Array<{ id: string; name: string }>;
    itemsByFolderId: Map<string, NavigationMenuItem[]>;
  }>(
    (acc, item) => {
      const isFolder =
        isDefined(item.name) &&
        !isDefined(item.folderId) &&
        !isDefined(item.targetRecordId) &&
        !isDefined(item.targetObjectMetadataId) &&
        !isDefined(item.viewId);

      if (isFolder) {
        acc.folders.push({ id: item.id, name: item.name || 'Folder' });
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
    { folders: [], itemsByFolderId: new Map() },
  );

  const navigationMenuItemsByFolder = folders.reduce<
    NavigationMenuItemFolder[]
  >((acc, folder) => {
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
        const objectRecordIdentifier = recordIdentifierToObjectRecordIdentifier(
          {
            recordIdentifier: targetRecordIdentifier,
            objectMetadataItem: itemObjectMetadata,
          },
        );

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
      folderId: folder.id,
      folderName: folder.name,
      navigationMenuItems: sortedItems,
    });

    return acc;
  }, []);

  return { navigationMenuItemsByFolder };
};
