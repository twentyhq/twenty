import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationMenuItemsDraftState = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );

  const workspaceNavigationMenuItemsFromState =
    filterWorkspaceNavigationMenuItems(navigationMenuItems);

  const workspaceNavigationMenuItems =
    isLayoutCustomizationModeEnabled && isDefined(navigationMenuItemsDraft)
      ? navigationMenuItemsDraft
      : workspaceNavigationMenuItemsFromState;

  const isDirty =
    isLayoutCustomizationModeEnabled &&
    isDefined(navigationMenuItemsDraft) &&
    !isDeeplyEqual(
      navigationMenuItemsDraft,
      workspaceNavigationMenuItemsFromState,
    );

  return {
    workspaceNavigationMenuItems,
    isDirty,
  };
};
