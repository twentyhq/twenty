import { NavigationMenuItemType } from 'twenty-shared/types';

import { getHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/common/utils/getHiddenNavigationMenuItemsInTab';

const NAVIGATION_MENU_ITEMS = [
  { id: 'sales-tab', parentId: null, type: NavigationMenuItemType.TAB },
  {
    id: 'hidden-app-tab',
    parentId: null,
    type: NavigationMenuItemType.TAB,
    isActive: false,
  },
  {
    id: 'hidden-home-section',
    parentId: null,
    type: NavigationMenuItemType.SECTION,
    isActive: false,
  },
  {
    id: 'object-in-hidden-section',
    parentId: 'hidden-home-section',
    type: NavigationMenuItemType.OBJECT,
    isActive: false,
  },
  {
    id: 'visible-sales-section',
    parentId: 'sales-tab',
    type: NavigationMenuItemType.SECTION,
    isActive: true,
  },
  {
    id: 'hidden-sales-object',
    parentId: 'visible-sales-section',
    type: NavigationMenuItemType.OBJECT,
    isActive: false,
  },
];

describe('getHiddenNavigationMenuItemsInTab', () => {
  it('should list the hidden tabs and hidden items of Home, without the ones inside another hidden item', () => {
    expect(
      getHiddenNavigationMenuItemsInTab({
        navigationMenuItems: NAVIGATION_MENU_ITEMS,
        excludedIds: new Set(),
        tabId: null,
      }).map(({ id }) => id),
    ).toEqual(['hidden-app-tab', 'hidden-home-section']);
  });

  it('should list the hidden items of a tab', () => {
    expect(
      getHiddenNavigationMenuItemsInTab({
        navigationMenuItems: NAVIGATION_MENU_ITEMS,
        excludedIds: new Set(),
        tabId: 'sales-tab',
      }).map(({ id }) => id),
    ).toEqual(['hidden-sales-object']);
  });

  it('should skip items already restored in the draft', () => {
    expect(
      getHiddenNavigationMenuItemsInTab({
        navigationMenuItems: NAVIGATION_MENU_ITEMS,
        excludedIds: new Set(['hidden-sales-object']),
        tabId: 'sales-tab',
      }),
    ).toEqual([]);
  });
});
