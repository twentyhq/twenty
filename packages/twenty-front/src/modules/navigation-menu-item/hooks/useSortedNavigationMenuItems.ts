import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { sortNavigationMenuItems } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();
  const coreViews = useRecoilValue(coreViewsState).map(convertCoreViewToView);

  const targetRecords = useMemo(() => {
    const recordsMap = new Map<string, ObjectRecord>();

    [...navigationMenuItems, ...workspaceNavigationMenuItems].forEach(
      (navigationMenuItem) => {
        if (isDefined(navigationMenuItem.viewId)) {
          return;
        }

        const itemTargetRecordId = navigationMenuItem.targetRecordId;
        if (!isDefined(itemTargetRecordId)) {
          return;
        }

        const targetRecord = navigationMenuItem.targetRecord;
        if (isDefined(targetRecord) && typeof targetRecord === 'object') {
          recordsMap.set(itemTargetRecordId, targetRecord);
        }
      },
    );

    return recordsMap;
  }, [navigationMenuItems, workspaceNavigationMenuItems]);

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
      if (isDefined(item.viewId)) {
        return coreViews.some((view) => view.id === item.viewId);
      }

      const itemTargetRecordId = item.targetRecordId;
      if (!isDefined(itemTargetRecordId)) {
        return false;
      }
      const matchesTargetRecord = targetRecords.has(itemTargetRecordId);
      return matchesTargetRecord;
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
