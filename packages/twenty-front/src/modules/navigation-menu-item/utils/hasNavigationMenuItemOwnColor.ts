import { NavigationMenuItemType } from 'twenty-shared/types';

// Only folders store their color directly on the navigation menu item.
// Views get color from objectMetadata; links use a fixed default; records have none.
export const hasNavigationMenuItemOwnColor = (item: { type?: string | null }) =>
  item.type === NavigationMenuItemType.FOLDER;
