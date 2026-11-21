import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemsInPlacementScope } from '@/navigation-menu-item/common/utils/getNavigationMenuItemsInPlacementScope';

const items = [
  { id: 'tab', type: NavigationMenuItemType.TAB, parentId: null },
  { id: 'section', type: NavigationMenuItemType.SECTION, parentId: 'tab' },
  { id: 'folder', type: NavigationMenuItemType.FOLDER, parentId: 'section' },
  { id: 'in-folder', type: NavigationMenuItemType.OBJECT, parentId: 'folder' },
  { id: 'in-tab', type: NavigationMenuItemType.OBJECT, parentId: 'tab' },
  { id: 'on-home', type: NavigationMenuItemType.OBJECT, parentId: null },
];

describe('getNavigationMenuItemsInPlacementScope', () => {
  it('should keep the items of the section, folders included', () => {
    expect(
      getNavigationMenuItemsInPlacementScope({ parentId: 'folder', items }).map(
        ({ id }) => id,
      ),
    ).toEqual(['folder', 'in-folder']);
  });

  it('should keep the items outside sections of the tab', () => {
    expect(
      getNavigationMenuItemsInPlacementScope({ parentId: 'tab', items }).map(
        ({ id }) => id,
      ),
    ).toEqual(['section', 'in-tab']);
  });

  it('should keep the items outside sections of Home', () => {
    expect(
      getNavigationMenuItemsInPlacementScope({ parentId: null, items }).map(
        ({ id }) => id,
      ),
    ).toEqual(['tab', 'on-home']);
  });
});
