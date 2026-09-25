import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// A divider at the end of a folder separates nothing and would leave the
// folder tree line open below the last item.
export const removeTrailingNavigationMenuItemDividers = <
  TNavigationMenuItem extends Pick<NavigationMenuItem, 'type'>,
>(
  navigationMenuItems: TNavigationMenuItem[],
): TNavigationMenuItem[] =>
  navigationMenuItems.slice(
    0,
    navigationMenuItems.findLastIndex(
      (navigationMenuItem) =>
        navigationMenuItem.type !== NavigationMenuItemType.DIVIDER,
    ) + 1,
  );
