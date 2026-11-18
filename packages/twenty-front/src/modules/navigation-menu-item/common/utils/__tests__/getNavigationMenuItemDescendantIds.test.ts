import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';

describe('getNavigationMenuItemDescendantIds', () => {
  it('should return every level below the item', () => {
    const items = [
      { id: 'tab', parentId: null },
      { id: 'section', parentId: 'tab' },
      { id: 'folder', parentId: 'section' },
      { id: 'link', parentId: 'folder' },
      { id: 'other', parentId: null },
    ];

    expect(
      getNavigationMenuItemDescendantIds({ items, ancestorId: 'tab' }),
    ).toEqual(['section', 'folder', 'link']);
  });

  it('should return nothing for an item without children', () => {
    expect(
      getNavigationMenuItemDescendantIds({
        items: [{ id: 'link', parentId: null }],
        ancestorId: 'link',
      }),
    ).toEqual([]);
  });
});
