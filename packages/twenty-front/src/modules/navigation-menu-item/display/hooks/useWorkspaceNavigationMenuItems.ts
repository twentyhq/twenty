import { useMemo } from 'react';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

import { isDefined } from 'twenty-shared/utils';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useWorkspaceNavigationMenuItems = (): {
  objectMetadataIdsInWorkspaceNav: Set<string>;
} => {
  const { workspaceNavigationMenuItems: rawWorkspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);

  const allWorkspaceNavigationMenuItemViewIds = useMemo(
    () =>
      new Set(
        rawWorkspaceNavigationMenuItems
          .map((item) => item.viewId)
          .filter((viewId) => isDefined(viewId)),
      ),
    [rawWorkspaceNavigationMenuItems],
  );

  const objectMetadataIdsInWorkspaceNav = useMemo(
    () =>
      new Set([
        ...views
          .filter((view) => allWorkspaceNavigationMenuItemViewIds.has(view.id))
          .map((view) => view.objectMetadataId),
        ...rawWorkspaceNavigationMenuItems
          .map((item) => item.targetObjectMetadataId)
          .filter((objectMetadataId) => isDefined(objectMetadataId)),
      ]),
    [
      views,
      allWorkspaceNavigationMenuItemViewIds,
      rawWorkspaceNavigationMenuItems,
    ],
  );

  return {
    objectMetadataIdsInWorkspaceNav,
  };
};
