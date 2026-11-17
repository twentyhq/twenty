import { isNonEmptyString } from '@sniptt/guards';

import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NamedNavigationMenuItem = NavigationMenuItem & { name: string };

export const getNavigationMenuTabsInDisplayOrder = (
  navigationMenuItems: NavigationMenuItem[],
): NamedNavigationMenuItem[] =>
  navigationMenuItems
    .filter(
      (item): item is NamedNavigationMenuItem =>
        isNavigationMenuItemTab(item) && isNonEmptyString(item.name),
    )
    .sort((a, b) => a.position - b.position);
