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
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

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
    const foldersMap = new Map<string, NavigationMenuItem[]>();

    navigationMenuItems.forEach((item) => {
      if (isDefined(item.folderId)) {
        const existing = foldersMap.get(item.folderId) || [];
        foldersMap.set(item.folderId, [...existing, item]);
      }
    });

    const folderItems: NavigationMenuItemFolder[] = [];

    foldersMap.forEach((folderItemsList, folderId) => {
      const folderNavigationMenuItem = navigationMenuItems.find(
        (item) => item.id === folderId,
      );

      if (!isDefined(folderNavigationMenuItem)) {
        return;
      }

      const folderName = (folderNavigationMenuItem as any).name || 'Folder';

      const targetRecordsMap = new Map<string, ObjectRecord>();
      folderItemsList.forEach((item) => {
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
        folderItemsList,
        getObjectRecordIdentifierByNameSingular,
        true,
        coreViews,
        objectMetadataItems,
        targetRecordsMap,
      );

      folderItems.push({
        folderId,
        folderName,
        navigationMenuItems: sortedItems,
      });
    });

    return folderItems;
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
