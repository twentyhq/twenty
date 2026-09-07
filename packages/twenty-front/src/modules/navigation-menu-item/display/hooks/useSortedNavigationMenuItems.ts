import { useMemo } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useEnsoViewerScope } from '@/enso/viewer-scope/hooks/useEnsoViewerScope';
import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);
  // The client receives every object's metadata regardless of readability,
  // so this has to be the readable subset: otherwise a folder whose children
  // are all unreadable still counts as having visible children.
  const { readableObjectMetadataItems: objectMetadataItems } =
    useReadableObjectMetadataItems();
  const { hiddenNavigationObjectNameSingulars } = useEnsoViewerScope();

  // A folder whose every child is hidden would otherwise sit in the sidebar as
  // an empty row — Twenty never permission-filters folders, so nothing else
  // removes it.
  const dropEmptyFolders = (
    items: NavigationMenuItem[],
    allItems: NavigationMenuItem[],
    visibleItems: NavigationMenuItem[],
  ) =>
    items.filter((item) => {
      if (item.type !== NavigationMenuItemType.FOLDER) {
        return true;
      }

      const hasAnyChild = allItems.some((other) => other.folderId === item.id);
      const hasVisibleChild = visibleItems.some(
        (other) => other.folderId === item.id,
      );

      return !hasAnyChild || hasVisibleChild;
    });

  const allNavigationMenuItems = useMemo(
    () => [...workspaceNavigationMenuItems, ...navigationMenuItems],
    [workspaceNavigationMenuItems, navigationMenuItems],
  );

  const allVisibleNavigationMenuItems = useMemo(
    () =>
      filterAndSortNavigationMenuItems(
        allNavigationMenuItems,
        views,
        objectMetadataItems,
        hiddenNavigationObjectNameSingulars,
      ),
    [
      allNavigationMenuItems,
      views,
      objectMetadataItems,
      hiddenNavigationObjectNameSingulars,
    ],
  );

  const navigationMenuItemsSorted = useMemo(() => {
    const visible = filterAndSortNavigationMenuItems(
      navigationMenuItems,
      views,
      objectMetadataItems,
      hiddenNavigationObjectNameSingulars,
    );

    return dropEmptyFolders(
      visible,
      allNavigationMenuItems,
      allVisibleNavigationMenuItems,
    );
  }, [
    navigationMenuItems,
    views,
    objectMetadataItems,
    hiddenNavigationObjectNameSingulars,
    allNavigationMenuItems,
    allVisibleNavigationMenuItems,
  ]);

  const workspaceNavigationMenuItemsSorted = useMemo(() => {
    const visible = filterAndSortNavigationMenuItems(
      workspaceNavigationMenuItems,
      views,
      objectMetadataItems,
      hiddenNavigationObjectNameSingulars,
    );

    return dropEmptyFolders(
      visible,
      allNavigationMenuItems,
      allVisibleNavigationMenuItems,
    );
  }, [
    workspaceNavigationMenuItems,
    views,
    objectMetadataItems,
    hiddenNavigationObjectNameSingulars,
    allNavigationMenuItems,
    allVisibleNavigationMenuItems,
  ]);

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
