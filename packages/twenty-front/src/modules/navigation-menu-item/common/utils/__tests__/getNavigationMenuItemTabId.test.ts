import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemTabId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemTabId';

const items = [
  { id: 'tab', type: NavigationMenuItemType.TAB, parentId: null },
  { id: 'section', type: NavigationMenuItemType.SECTION, parentId: 'tab' },
  { id: 'folder', type: NavigationMenuItemType.FOLDER, parentId: 'section' },
  { id: 'home-section', type: NavigationMenuItemType.SECTION, parentId: null },
];

describe('getNavigationMenuItemTabId', () => {
  it('should return the tab an item sits in, however deep', () => {
    expect(getNavigationMenuItemTabId({ parentId: 'tab', items })).toBe('tab');
    expect(getNavigationMenuItemTabId({ parentId: 'section', items })).toBe(
      'tab',
    );
    expect(getNavigationMenuItemTabId({ parentId: 'folder', items })).toBe(
      'tab',
    );
  });

  it('should return null for an item on Home', () => {
    expect(
      getNavigationMenuItemTabId({ parentId: 'home-section', items }),
    ).toBeNull();
    expect(getNavigationMenuItemTabId({ parentId: null, items })).toBeNull();
    expect(
      getNavigationMenuItemTabId({ parentId: undefined, items }),
    ).toBeNull();
  });
});
