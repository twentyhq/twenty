import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useRecoilValue } from 'recoil';
import {
  type NavigationMenuItem,
  useGetCurrentUserQuery,
} from '~/generated-metadata/graphql';

type PrefetchedNavigationMenuItemsData = {
  navigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItems: NavigationMenuItem[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedNavigationMenuItemsData =
  (): PrefetchedNavigationMenuItemsData => {
    const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;
    const { data: currentUserData } = useGetCurrentUserQuery();
    const currentUserWorkspaceId =
      currentUserData?.currentUser?.currentUserWorkspace?.id;
    const prefetchNavigationMenuItems = useRecoilValue(
      prefetchNavigationMenuItemsState,
    );

    const navigationMenuItems = prefetchNavigationMenuItems.filter(
      (item) => item.userWorkspaceId === currentUserWorkspaceId,
    );

    const workspaceNavigationMenuItems = prefetchNavigationMenuItems.filter(
      (item) => item.userWorkspaceId === null,
    );

    return {
      navigationMenuItems,
      workspaceNavigationMenuItems,
      currentWorkspaceMemberId,
    };
  };
