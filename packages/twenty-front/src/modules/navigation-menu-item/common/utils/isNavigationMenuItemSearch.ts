import { NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_ITEM_SEARCH_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemSearchLink';

type NavigationMenuItemSearch<T extends { type: string }> = T & {
  link: typeof NAVIGATION_MENU_ITEM_SEARCH_LINK;
};

export const isNavigationMenuItemSearch = <
  T extends { type: string; link?: string | null },
>(
  item: T,
): item is NavigationMenuItemSearch<T> =>
  item.type === NavigationMenuItemType.LINK &&
  (item.link ?? '').trim() === NAVIGATION_MENU_ITEM_SEARCH_LINK;
