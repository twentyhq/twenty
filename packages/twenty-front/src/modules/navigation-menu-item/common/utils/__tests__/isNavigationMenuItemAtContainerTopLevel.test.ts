import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemAtContainerTopLevel } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAtContainerTopLevel';

const items = [
  { id: 'tab', type: NavigationMenuItemType.TAB },
  { id: 'section', type: NavigationMenuItemType.SECTION },
  { id: 'folder', type: NavigationMenuItemType.FOLDER },
];

describe('isNavigationMenuItemAtContainerTopLevel', () => {
  it('should return true for an item at Home top level', () => {
    expect(
      isNavigationMenuItemAtContainerTopLevel({
        item: { parentId: null },
        items,
      }),
    ).toBe(true);
  });

  it('should return true for an item at a tab top level', () => {
    expect(
      isNavigationMenuItemAtContainerTopLevel({
        item: { parentId: 'tab' },
        items,
      }),
    ).toBe(true);
  });

  it('should return false for an item inside a section or a folder', () => {
    expect(
      isNavigationMenuItemAtContainerTopLevel({
        item: { parentId: 'section' },
        items,
      }),
    ).toBe(false);
    expect(
      isNavigationMenuItemAtContainerTopLevel({
        item: { parentId: 'folder' },
        items,
      }),
    ).toBe(false);
  });
});
