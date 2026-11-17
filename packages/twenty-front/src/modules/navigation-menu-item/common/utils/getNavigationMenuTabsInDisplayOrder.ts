import { isNonEmptyString } from '@sniptt/guards';

import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuTabsInDisplayOrder = (
  navigationMenuItems: NavigationMenuItem[],
): NamedNavigationMenuItem[] =>
  navigationMenuItems
    .filter(
      (item): item is NamedNavigationMenuItem =>
        isNavigationMenuItemTab(item) && isNonEmptyString(item.name),
    )
    .sort((a, b) => a.position - b.position);
