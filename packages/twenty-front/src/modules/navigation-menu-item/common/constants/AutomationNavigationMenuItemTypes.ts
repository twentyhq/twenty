import { NavigationMenuItemType } from 'twenty-shared/types';

export const AUTOMATION_NAVIGATION_MENU_ITEM_TYPES = [
  NavigationMenuItemType.WORKFLOW,
  NavigationMenuItemType.AGENT,
] as const satisfies readonly NavigationMenuItemType[];
