import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';

describe('filterActiveNavigationMenuItems', () => {
  it('should drop hidden items and everything inside them', () => {
    const navigationMenuItems = [
      { id: 'hidden-folder', parentId: null, isActive: false },
      { id: 'child', parentId: 'hidden-folder', isActive: true },
      { id: 'grandchild', parentId: 'child', isActive: true },
      { id: 'visible-folder', parentId: null, isActive: true },
      { id: 'visible-child', parentId: 'visible-folder', isActive: true },
    ];

    expect(
      filterActiveNavigationMenuItems(navigationMenuItems).map(({ id }) => id),
    ).toEqual(['visible-folder', 'visible-child']);
  });

  it('should keep items cached before isActive existed', () => {
    const navigationMenuItems = [{ id: 'cached', parentId: null }];

    expect(filterActiveNavigationMenuItems(navigationMenuItems)).toEqual(
      navigationMenuItems,
    );
  });
});
