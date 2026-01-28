import { useRecoilValue } from 'recoil';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { isDefined } from 'twenty-shared/utils';
import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from './useSortedNavigationMenuItems';

export const useWorkspaceNavigationMenuItems = (): {
  workspaceNavigationMenuItemsObjectMetadataItems: ObjectMetadataItem[];
} => {
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { workspaceNavigationMenuItems: rawWorkspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const coreViews = useRecoilValue(coreViewsState);

  const views = coreViews.map(convertCoreViewToView);

  const workspaceNavigationMenuItemViewIds = new Set(
    workspaceNavigationMenuItemsSorted
      .map((item) => item.viewId)
      .filter((viewId) => isDefined(viewId)),
  );

  const navigationMenuItemViewObjectMetadataIds = new Set(
    views.reduce<string[]>((acc, view) => {
      if (workspaceNavigationMenuItemViewIds.has(view.id)) {
        acc.push(view.objectMetadataId);
      }
      return acc;
    }, []),
  );

  const navigationMenuItemRecordObjectMetadataIds = new Set(
    rawWorkspaceNavigationMenuItems
      .map((item) => item.targetObjectMetadataId)
      .filter((objectMetadataId) => isDefined(objectMetadataId)),
  );

  const allNavigationMenuItemObjectMetadataIds = new Set([
    ...navigationMenuItemViewObjectMetadataIds,
    ...navigationMenuItemRecordObjectMetadataIds,
  ]);

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const activeNonSystemObjectMetadataItemsInWorkspaceNavigationMenuItems: ObjectMetadataItem[] =
    activeNonSystemObjectMetadataItems.filter((item: ObjectMetadataItem) =>
      allNavigationMenuItemObjectMetadataIds.has(item.id),
    );

  return {
    workspaceNavigationMenuItemsObjectMetadataItems:
      activeNonSystemObjectMetadataItemsInWorkspaceNavigationMenuItems,
  };
};
