import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isNavigationMenuInEditModeStateV2 } from '@/navigation-menu-item/states/isNavigationMenuInEditModeStateV2';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type PrefetchedNavigationMenuItemsData = {
  navigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItems: NavigationMenuItem[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedNavigationMenuItemsData =
  (): PrefetchedNavigationMenuItemsData => {
    const currentWorkspaceMember = useAtomValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;
    const prefetchNavigationMenuItems = useAtomValue(
      prefetchNavigationMenuItemsState,
    );
    const isNavigationMenuInEditMode = useAtomValue(
      isNavigationMenuInEditModeStateV2,
    );
    const navigationMenuItemsDraft = useAtomValue(
      navigationMenuItemsDraftStateV2,
    );

    const navigationMenuItems = prefetchNavigationMenuItems.filter((item) =>
      isDefined(item.userWorkspaceId),
    );

    const workspaceNavigationMenuItemsFromPrefetch =
      filterWorkspaceNavigationMenuItems(prefetchNavigationMenuItems);

    const workspaceNavigationMenuItems =
      isNavigationMenuInEditMode && isDefined(navigationMenuItemsDraft)
        ? navigationMenuItemsDraft
        : workspaceNavigationMenuItemsFromPrefetch;

    return {
      navigationMenuItems,
      workspaceNavigationMenuItems,
      currentWorkspaceMemberId,
    };
  };
