import { NAVIGATION_MENU_ITEM_SEARCH_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemSearchLink';
import { isNavigationMenuItemSearch } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSearch';
import { NavigationMenuItemType } from 'twenty-shared/types';

describe('isNavigationMenuItemSearch', () => {
  it('should return true for the search navigation menu item link', () => {
    expect(
      isNavigationMenuItemSearch({
        type: NavigationMenuItemType.LINK,
        link: NAVIGATION_MENU_ITEM_SEARCH_LINK,
      }),
    ).toBe(true);
  });

  it('should return true when the search link has surrounding whitespace', () => {
    expect(
      isNavigationMenuItemSearch({
        type: NavigationMenuItemType.LINK,
        link: ` ${NAVIGATION_MENU_ITEM_SEARCH_LINK} `,
      }),
    ).toBe(true);
  });

  it('should return false for regular link navigation menu items', () => {
    expect(
      isNavigationMenuItemSearch({
        type: NavigationMenuItemType.LINK,
        link: 'https://example.com',
      }),
    ).toBe(false);
  });

  it('should return false for non-link navigation menu items', () => {
    expect(
      isNavigationMenuItemSearch({
        type: NavigationMenuItemType.OBJECT,
        link: NAVIGATION_MENU_ITEM_SEARCH_LINK,
      }),
    ).toBe(false);
  });
});
