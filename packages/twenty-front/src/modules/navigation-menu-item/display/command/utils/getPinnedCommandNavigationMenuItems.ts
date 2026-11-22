import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getPinnedCommandNavigationMenuItems = <
  TNavigationMenuItem extends Pick<
    NavigationMenuItem,
    'type' | 'parentId' | 'position' | 'isActive'
  >,
>(
  navigationMenuItems: TNavigationMenuItem[],
): TNavigationMenuItem[] =>
  navigationMenuItems
    .filter(
      (navigationMenuItem) =>
        navigationMenuItem.type === NavigationMenuItemType.COMMAND &&
        !isDefined(navigationMenuItem.parentId) &&
        navigationMenuItem.isActive !== false,
    )
    .sort((first, second) => first.position - second.position);
