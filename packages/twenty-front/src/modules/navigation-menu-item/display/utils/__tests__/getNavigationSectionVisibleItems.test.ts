import { getNavigationSectionVisibleItems } from '@/navigation-menu-item/display/utils/getNavigationSectionVisibleItems';

const ITEMS = ['a', 'b', 'c', 'd'];

describe('getNavigationSectionVisibleItems', () => {
  it('shows every item when there is no limit', () => {
    expect(
      getNavigationSectionVisibleItems({
        items: ITEMS,
        visibleItemLimit: null,
        hasMoreItemsToLoad: true,
      }),
    ).toEqual({ visibleItems: ITEMS, hiddenItems: [], hasHiddenItems: false });
  });

  it('splits the items at the limit', () => {
    expect(
      getNavigationSectionVisibleItems({ items: ITEMS, visibleItemLimit: 2 }),
    ).toEqual({
      visibleItems: ['a', 'b'],
      hiddenItems: ['c', 'd'],
      hasHiddenItems: true,
    });
  });

  it('hides nothing when the items fit the limit', () => {
    expect(
      getNavigationSectionVisibleItems({ items: ITEMS, visibleItemLimit: 4 }),
    ).toEqual({ visibleItems: ITEMS, hiddenItems: [], hasHiddenItems: false });
  });

  it('reports hidden items when more can still be loaded', () => {
    expect(
      getNavigationSectionVisibleItems({
        items: ITEMS,
        visibleItemLimit: 4,
        hasMoreItemsToLoad: true,
      }).hasHiddenItems,
    ).toBe(true);
  });
});
