import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemContainerId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerId';

const items = [
  { id: 'section', type: NavigationMenuItemType.SECTION, parentId: 'tab' },
  { id: 'folder', type: NavigationMenuItemType.FOLDER, parentId: 'section' },
  { id: 'root-folder', type: NavigationMenuItemType.FOLDER, parentId: null },
];

describe('getNavigationMenuItemContainerId', () => {
  it('should return the tab or section an item sits in', () => {
    expect(
      getNavigationMenuItemContainerId({
        item: { parentId: 'section' },
        items,
      }),
    ).toBe('section');
  });

  it('should return the container of the folder an item sits in', () => {
    expect(
      getNavigationMenuItemContainerId({ item: { parentId: 'folder' }, items }),
    ).toBe('section');
    expect(
      getNavigationMenuItemContainerId({
        item: { parentId: 'root-folder' },
        items,
      }),
    ).toBeNull();
  });

  it('should return null for a root item', () => {
    expect(
      getNavigationMenuItemContainerId({ item: { parentId: null }, items }),
    ).toBeNull();
  });
});
