import { NAVIGATION_MENU_ITEM_TYPE } from '@/navigation-menu-item/types/navigation-menu-item-type';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';

describe('isLocationMatchingNavigationMenuItem', () => {
  it('should return true when item link matches current path (non-view) or current view path (view)', () => {
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/people',
        '/app/objects/people?viewId=123',
        {
          itemType: NAVIGATION_MENU_ITEM_TYPE.RECORD,
          link: '/app/objects/people',
        },
      ),
    ).toBe(true);
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/companies',
        '/app/objects/companies?viewId=123',
        {
          itemType: NAVIGATION_MENU_ITEM_TYPE.VIEW,
          link: '/app/objects/companies?viewId=123',
        },
      ),
    ).toBe(true);
  });

  it('should return false when item link does not match path', () => {
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/people',
        '/app/objects/people?viewId=123',
        {
          itemType: NAVIGATION_MENU_ITEM_TYPE.RECORD,
          link: '/app/objects/company',
        },
      ),
    ).toBe(false);
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/companies',
        '/app/objects/companies?viewId=123',
        {
          itemType: NAVIGATION_MENU_ITEM_TYPE.VIEW,
          link: '/app/objects/companies?viewId=456',
        },
      ),
    ).toBe(false);
  });
});
