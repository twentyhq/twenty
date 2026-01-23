import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

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
  const coreViews = useRecoilValue(coreViewsState).map(convertCoreViewToView);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();

  const navigationMenuItemsByFolder = useMemo(() => {
    const folderItems = navigationMenuItems.filter(
      (item) =>
        isDefined(item.name) &&
        !isDefined(item.folderId) &&
        !isDefined(item.targetRecordId) &&
        !isDefined(item.targetObjectMetadataId) &&
        !isDefined(item.viewId),
    );

    const folderItemsResult: NavigationMenuItemFolder[] = [];

    folderItems.forEach((folderItem) => {
      const folderId = folderItem.id;
      const folderName = folderItem.name || 'Folder';

      const itemsInFolder = navigationMenuItems.filter(
        (item) => item.folderId === folderId,
      );

      const targetRecordIdentifiersMap = new Map<
        string,
        ObjectRecordIdentifier
      >();
      itemsInFolder.forEach((item) => {
        const itemTargetRecordId = item.targetRecordId;
        if (!isDefined(itemTargetRecordId) || isDefined(item.viewId)) {
          return;
        }

        const targetRecordIdentifier = item.targetRecordIdentifier;

        if (!isDefined(targetRecordIdentifier)) {
          return;
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

          targetRecordIdentifiersMap.set(
            itemTargetRecordId,
            objectRecordIdentifier,
          );
        }
      });

      const sortedItems = sortNavigationMenuItems(
        itemsInFolder,
        true,
        coreViews,
        objectMetadataItems,
        targetRecordIdentifiersMap,
      );

      folderItemsResult.push({
        folderId,
        folderName,
        navigationMenuItems: sortedItems,
      });
    });

    return folderItemsResult;
  }, [navigationMenuItems, objectMetadataItems, coreViews]);

  return { navigationMenuItemsByFolder };
};
