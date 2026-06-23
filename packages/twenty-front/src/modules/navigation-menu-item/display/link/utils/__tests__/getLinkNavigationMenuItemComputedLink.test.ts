import { NAVIGATION_MENU_ITEM_SEARCH_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemSearchLink';
import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemComputedLink';
import { NavigationMenuItemType } from 'twenty-shared/types';

describe('getLinkNavigationMenuItemComputedLink', () => {
  it('should preserve the search navigation action link', () => {
    expect(
      getLinkNavigationMenuItemComputedLink({
        type: NavigationMenuItemType.LINK,
        link: NAVIGATION_MENU_ITEM_SEARCH_LINK,
      }),
    ).toBe(NAVIGATION_MENU_ITEM_SEARCH_LINK);
  });

  it('should preserve an absolute link', () => {
    expect(
      getLinkNavigationMenuItemComputedLink({
        type: NavigationMenuItemType.LINK,
        link: 'https://example.com',
      }),
    ).toBe('https://example.com');
  });

  it('should add a scheme to a regular link without one', () => {
    expect(
      getLinkNavigationMenuItemComputedLink({
        type: NavigationMenuItemType.LINK,
        link: 'example.com',
      }),
    ).toBe('https://example.com');
  });
});
