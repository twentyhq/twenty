import { hasFavoriteNavigationMenuItems } from '@/navigation-menu-item/common/utils/hasFavoriteNavigationMenuItems';

describe('hasFavoriteNavigationMenuItems', () => {
  it('returns false when there are no favorites', () => {
    expect(hasFavoriteNavigationMenuItems([])).toBe(false);
  });

  it('returns false when every favorite sits inside a folder', () => {
    expect(hasFavoriteNavigationMenuItems([{ parentId: 'folder' }])).toBe(
      false,
    );
  });

  it('returns true when a favorite sits at the top level', () => {
    expect(
      hasFavoriteNavigationMenuItems([
        { parentId: 'folder' },
        { parentId: null },
      ]),
    ).toBe(true);
  });
});
