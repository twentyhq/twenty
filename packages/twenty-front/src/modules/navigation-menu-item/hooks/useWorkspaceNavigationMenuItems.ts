import { useMemo } from 'react';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsSelector } from '@/views/states/selectors/coreViewsSelector';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { isDefined } from 'twenty-shared/utils';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useWorkspaceNavigationMenuItems = (): {
  workspaceNavigationMenuItemsObjectMetadataItems: ObjectMetadataItem[];
} => {
  const { workspaceNavigationMenuItems: rawWorkspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const coreViews = useAtomStateValue(coreViewsSelector);

  const views = coreViews.map(convertCoreViewToView);

  const workspaceFolderIds = useMemo(
    () =>
      new Set(
        rawWorkspaceNavigationMenuItems
          .filter(isNavigationMenuItemFolder)
          .map((item) => item.id),
      ),
    [rawWorkspaceNavigationMenuItems],
  );

  const workspaceNavigationMenuItemsIncludingFolderItems = useMemo(
    () =>
      rawWorkspaceNavigationMenuItems.filter(
        (item) =>
          !isDefined(item.folderId) ||
          (isDefined(item.folderId) && workspaceFolderIds.has(item.folderId)),
      ),
    [rawWorkspaceNavigationMenuItems, workspaceFolderIds],
  );

  const workspaceNavigationMenuItemViewIds = new Set(
    workspaceNavigationMenuItemsIncludingFolderItems
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
    workspaceNavigationMenuItemsIncludingFolderItems
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
