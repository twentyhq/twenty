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

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const { objectMetadataItems: objectMetadataItemsFromHook } =
    useObjectMetadataItems();
  const apolloCoreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();
  const coreViews = useRecoilValue(coreViewsState).map(convertCoreViewToView);

  const targetRecords = useMemo(() => {
    const recordsMap = new Map<string, ObjectRecord>();

    [...navigationMenuItems, ...workspaceNavigationMenuItems].forEach(
      (navigationMenuItem) => {
        const objectMetadataItem = objectMetadataItemsFromHook.find(
          (item) => item.id === navigationMenuItem.targetObjectMetadataId,
        );

        if (!isDefined(objectMetadataItem)) {
          return;
        }

        const recordGqlFields = generateDepthRecordGqlFieldsFromObject({
          objectMetadataItem,
          depth: 1,
          objectMetadataItems: objectMetadataItemsFromHook,
        });

        const itemTargetRecordId = navigationMenuItem.targetRecordId;
        if (!isDefined(itemTargetRecordId)) {
          return;
        }

        const targetRecord = getRecordFromCache<ObjectRecord>({
          cache: apolloCoreClient.cache,
          recordId: itemTargetRecordId,
          objectMetadataItems: objectMetadataItemsFromHook,
          objectMetadataItem,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });

        if (isDefined(targetRecord)) {
          recordsMap.set(itemTargetRecordId, targetRecord);
        }
      },
    );

    return recordsMap;
  }, [
    navigationMenuItems,
    workspaceNavigationMenuItems,
    objectMetadataItemsFromHook,
    apolloCoreClient.cache,
    objectPermissionsByObjectMetadataId,
  ]);

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const navigationMenuItemsSorted = useMemo(() => {
    return sortNavigationMenuItems(
      navigationMenuItems,
      getObjectRecordIdentifierByNameSingular,
      true,
      coreViews,
      objectMetadataItems,
      targetRecords,
    );
  }, [
    navigationMenuItems,
    getObjectRecordIdentifierByNameSingular,
    coreViews,
    objectMetadataItems,
    targetRecords,
  ]);

  const workspaceNavigationMenuItemsSorted = useMemo(() => {
    const filtered = workspaceNavigationMenuItems.filter((item) => {
      const itemTargetRecordId = item.targetRecordId;
      if (!isDefined(itemTargetRecordId)) {
        return false;
      }
      const matchesView = coreViews.some(
        (view) => view.id === itemTargetRecordId,
      );
      const matchesTargetRecord = targetRecords.has(itemTargetRecordId);
      return matchesView || matchesTargetRecord;
    });
    return sortNavigationMenuItems(
      filtered,
      getObjectRecordIdentifierByNameSingular,
      false,
      coreViews,
      objectMetadataItems,
      targetRecords,
    );
  }, [
    workspaceNavigationMenuItems,
    getObjectRecordIdentifierByNameSingular,
    coreViews,
    objectMetadataItems,
    targetRecords,
  ]);

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
