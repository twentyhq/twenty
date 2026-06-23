import { NAVIGATION_MENU_ITEM_SEARCH_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemSearchLink';
import { buildCreateNavigationMenuItemInput } from '@/navigation-menu-item/common/utils/buildCreateNavigationMenuItemInput';
import {
  type NavigationMenuItem,
  NavigationMenuItemType,
} from '~/generated-metadata/graphql';

const buildLinkNavigationMenuItem = (link: string): NavigationMenuItem =>
  ({
    id: 'navigation-menu-item-id',
    type: NavigationMenuItemType.LINK,
    name: 'Search',
    link,
    position: 0,
    createdAt: '',
    updatedAt: '',
  }) as NavigationMenuItem;

describe('buildCreateNavigationMenuItemInput', () => {
  it('should preserve the search navigation action link', () => {
    expect(
      buildCreateNavigationMenuItemInput(
        buildLinkNavigationMenuItem(NAVIGATION_MENU_ITEM_SEARCH_LINK),
        (folderId) => folderId,
      ).link,
    ).toBe(NAVIGATION_MENU_ITEM_SEARCH_LINK);
  });

  it('should still make regular link navigation menu items absolute', () => {
    expect(
      buildCreateNavigationMenuItemInput(
        buildLinkNavigationMenuItem('example.com'),
        (folderId) => folderId,
      ).link,
    ).toBe('https://example.com');
  });
});
