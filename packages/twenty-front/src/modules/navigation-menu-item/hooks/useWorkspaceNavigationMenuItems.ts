import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';

import { useSortedNavigationMenuItems } from './useSortedNavigationMenuItems';

export const useWorkspaceNavigationMenuItems = (): {
  workspaceNavigationMenuItemsObjectMetadataItems: ObjectMetadataItem[];
} => {
  const featureFlags = useFeatureFlagsMap();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const coreViews = useRecoilValue(coreViewsState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const views = coreViews
    .map(convertCoreViewToView)
    .filter(
      (view) =>
        featureFlags[FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED] === true ||
        view.objectMetadataId !==
          objectMetadataItems.find(
            (item) => item.nameSingular === CoreObjectNameSingular.Dashboard,
          )?.id,
    );

  const workspaceNavigationMenuItemIds = new Set(
    workspaceNavigationMenuItemsSorted.map((item) => item.targetRecordId),
  );

  const navigationMenuItemViewObjectMetadataIds = new Set(
    views.reduce<string[]>((acc, view) => {
      if (workspaceNavigationMenuItemIds.has(view.id)) {
        acc.push(view.objectMetadataId);
      }
      return acc;
    }, []),
  );

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const activeNonSystemObjectMetadataItemsInWorkspaceNavigationMenuItems: ObjectMetadataItem[] =
    activeNonSystemObjectMetadataItems.filter((item: ObjectMetadataItem) =>
      navigationMenuItemViewObjectMetadataIds.has(item.id),
    );

  return {
    workspaceNavigationMenuItemsObjectMetadataItems:
      activeNonSystemObjectMetadataItemsInWorkspaceNavigationMenuItems,
  };
};
