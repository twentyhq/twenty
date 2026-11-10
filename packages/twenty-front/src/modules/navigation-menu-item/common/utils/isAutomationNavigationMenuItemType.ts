import { type NavigationMenuItemType } from 'twenty-shared/types';

import { AUTOMATION_NAVIGATION_MENU_ITEM_TYPES } from '@/navigation-menu-item/common/constants/AutomationNavigationMenuItemTypes';

export const isAutomationNavigationMenuItemType = (
  type: NavigationMenuItemType,
): type is (typeof AUTOMATION_NAVIGATION_MENU_ITEM_TYPES)[number] =>
  AUTOMATION_NAVIGATION_MENU_ITEM_TYPES.some(
    (automationNavigationMenuItemType) =>
      automationNavigationMenuItemType === type,
  );
