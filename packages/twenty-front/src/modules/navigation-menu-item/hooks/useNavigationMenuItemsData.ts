import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isLayoutCustomizationModeEnabledState } from '@/app/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemsData = {
  navigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItems: NavigationMenuItem[];
  currentWorkspaceMemberId: string | undefined;
};

export const useNavigationMenuItemsData = (): NavigationMenuItemsData => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsState);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );

  const userNavigationMenuItems = navigationMenuItems.filter((item) =>
    isDefined(item.userWorkspaceId),
  );

  const workspaceNavigationMenuItemsFromState =
    filterWorkspaceNavigationMenuItems(navigationMenuItems);

  const workspaceNavigationMenuItems =
    isLayoutCustomizationModeEnabled && isDefined(navigationMenuItemsDraft)
      ? navigationMenuItemsDraft
      : workspaceNavigationMenuItemsFromState;

  return {
    navigationMenuItems: userNavigationMenuItems,
    workspaceNavigationMenuItems,
    currentWorkspaceMemberId,
  };
};
