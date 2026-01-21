import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { sortNavigationMenuItems } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';

type NavigationMenuItemFolder = {
  folderId: string;
  folderName: string;
  navigationMenuItems: ReturnType<typeof sortNavigationMenuItems>[number][];
};

export const useNavigationMenuItemsByFolder = () => {
  const { objectMetadataItems: objectMetadataItemsFromHook } =
    useObjectMetadataItems();
  const apolloCoreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();
  const coreViews = useRecoilValue(coreViewsState).map(convertCoreViewToView);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();

  const navigationMenuItemsByFolder = useMemo(() => {
    const folderItems = navigationMenuItems.filter(
      (item) =>
        isDefined(item.name) &&
        !isDefined(item.folderId) &&
        !isDefined(item.targetRecordId) &&
        !isDefined(item.targetObjectMetadataId),
    );

    const folderItemsResult: NavigationMenuItemFolder[] = [];

    folderItems.forEach((folderItem) => {
      const folderId = folderItem.id;
      const folderName = folderItem.name || 'Folder';

      const itemsInFolder = navigationMenuItems.filter(
        (item) => item.folderId === folderId,
      );

      const targetRecordsMap = new Map<string, ObjectRecord>();
      itemsInFolder.forEach((item) => {
        const itemTargetRecordId = item.targetRecordId;
        if (!isDefined(itemTargetRecordId)) {
          return;
        }

        const itemObjectMetadata = objectMetadataItemsFromHook.find(
          (meta) => meta.id === item.targetObjectMetadataId,
        );
        if (isDefined(itemObjectMetadata)) {
          const itemRecordGqlFields = generateDepthRecordGqlFieldsFromObject({
            objectMetadataItem: itemObjectMetadata,
            depth: 1,
            objectMetadataItems: objectMetadataItemsFromHook,
          });
          const itemRecord = getRecordFromCache<ObjectRecord>({
            cache: apolloCoreClient.cache,
            recordId: itemTargetRecordId,
            objectMetadataItems: objectMetadataItemsFromHook,
            objectMetadataItem: itemObjectMetadata,
            recordGqlFields: itemRecordGqlFields,
            objectPermissionsByObjectMetadataId,
          });
          if (isDefined(itemRecord)) {
            targetRecordsMap.set(itemTargetRecordId, itemRecord);
          }
        }
      });

      const sortedItems = sortNavigationMenuItems(
        itemsInFolder,
        getObjectRecordIdentifierByNameSingular,
        true,
        coreViews,
        objectMetadataItems,
        targetRecordsMap,
      );

      folderItemsResult.push({
        folderId,
        folderName,
        navigationMenuItems: sortedItems,
      });
    });

    return folderItemsResult;
  }, [
    navigationMenuItems,
    objectMetadataItemsFromHook,
    objectMetadataItems,
    apolloCoreClient.cache,
    objectPermissionsByObjectMetadataId,
    getObjectRecordIdentifierByNameSingular,
    coreViews,
  ]);

  return { navigationMenuItemsByFolder };
};
