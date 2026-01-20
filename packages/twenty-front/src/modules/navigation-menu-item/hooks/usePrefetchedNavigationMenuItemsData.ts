import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { useRecoilValue } from 'recoil';

type PrefetchedNavigationMenuItemsData = {
  navigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItems: NavigationMenuItem[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedNavigationMenuItemsData =
  (): PrefetchedNavigationMenuItemsData => {
    const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;
    const prefetchNavigationMenuItems = useRecoilValue(
      prefetchNavigationMenuItemsState,
    );

    const navigationMenuItems = prefetchNavigationMenuItems.filter(
      (item) => item.forWorkspaceMemberId === currentWorkspaceMemberId,
    );

    const workspaceNavigationMenuItems = prefetchNavigationMenuItems.filter(
      (item) => item.forWorkspaceMemberId === null,
    );

    return {
      navigationMenuItems,
      workspaceNavigationMenuItems,
      currentWorkspaceMemberId,
    };
  };
