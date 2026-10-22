import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';

describe('getNavigationMenuItemDescendantIds', () => {
  it('collects every item nested under a tab', () => {
    const items = [
      { id: 'tab', folderId: null },
      { id: 'section', folderId: 'tab' },
      { id: 'folder', folderId: 'section' },
      { id: 'view', folderId: 'folder' },
      { id: 'link', folderId: 'tab' },
      { id: 'home-item', folderId: null },
    ];

    expect(getNavigationMenuItemDescendantIds(items, 'tab').sort()).toEqual(
      ['folder', 'link', 'section', 'view'].sort(),
    );
  });

  it('returns nothing for an item without children', () => {
    expect(
      getNavigationMenuItemDescendantIds(
        [{ id: 'link', folderId: null }],
        'link',
      ),
    ).toEqual([]);
  });
});
