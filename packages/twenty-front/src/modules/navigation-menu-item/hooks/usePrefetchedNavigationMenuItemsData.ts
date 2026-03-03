import { useMemo } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { filterNavigationMenuItemsByRole } from '@/navigation-menu-item/utils/filterNavigationMenuItemsByRole';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type PrefetchedNavigationMenuItemsData = {
  navigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItems: NavigationMenuItem[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedNavigationMenuItemsData =
  (): PrefetchedNavigationMenuItemsData => {
    const currentWorkspaceMember = useAtomStateValue(
      currentWorkspaceMemberState,
    );
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;
    const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
    const prefetchNavigationMenuItems = useAtomStateValue(
      prefetchNavigationMenuItemsState,
    );
    const isNavigationMenuInEditMode = useAtomStateValue(
      isNavigationMenuInEditModeState,
    );
    const navigationMenuItemsDraft = useAtomStateValue(
      navigationMenuItemsDraftState,
    );

    const coreViews = useAtomStateValue(coreViewsState);
    const views = useMemo(
      () => coreViews.map(convertCoreViewToView),
      [coreViews],
    );

    const sidebarPermissions = useMemo(() => {
      const map = new Map<string, boolean>();

      if (isDefined(currentUserWorkspace?.objectsPermissions)) {
        for (const permission of currentUserWorkspace.objectsPermissions) {
          map.set(permission.objectMetadataId, permission.showInSidebar);
        }
      }

      return map;
    }, [currentUserWorkspace?.objectsPermissions]);

    const navigationMenuItems = prefetchNavigationMenuItems.filter((item) =>
      isDefined(item.userWorkspaceId),
    );

    const workspaceNavigationMenuItemsFromPrefetch =
      filterWorkspaceNavigationMenuItems(prefetchNavigationMenuItems);

    // Apply role-based filtering for sidebar visibility (skip in edit mode)
    const roleFilteredItems = useMemo(
      () =>
        filterNavigationMenuItemsByRole(
          workspaceNavigationMenuItemsFromPrefetch,
          sidebarPermissions,
          views,
        ),
      [workspaceNavigationMenuItemsFromPrefetch, sidebarPermissions, views],
    );

    const workspaceNavigationMenuItems =
      isNavigationMenuInEditMode && isDefined(navigationMenuItemsDraft)
        ? navigationMenuItemsDraft
        : roleFilteredItems;

    return {
      navigationMenuItems,
      workspaceNavigationMenuItems,
      currentWorkspaceMemberId,
    };
  };
