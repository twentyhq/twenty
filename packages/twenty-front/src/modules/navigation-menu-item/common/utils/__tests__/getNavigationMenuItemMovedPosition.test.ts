import { getNavigationMenuItemMovedPosition } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMovedPosition';

const siblings = [
  { id: 'a', position: 1 },
  { id: 'b', position: 2 },
  { id: 'c', position: 3 },
];

describe('getNavigationMenuItemMovedPosition', () => {
  it('should place the item between its new neighbours', () => {
    expect(
      getNavigationMenuItemMovedPosition({ siblings, itemId: 'c', offset: -1 }),
    ).toBe(1.5);
    expect(
      getNavigationMenuItemMovedPosition({ siblings, itemId: 'a', offset: 1 }),
    ).toBe(2.5);
  });

  it('should place the item past the end it moves to', () => {
    expect(
      getNavigationMenuItemMovedPosition({ siblings, itemId: 'b', offset: -1 }),
    ).toBe(0);
    expect(
      getNavigationMenuItemMovedPosition({ siblings, itemId: 'b', offset: 1 }),
    ).toBe(4);
  });

  it('should refuse a move past the first or last sibling', () => {
    expect(
      getNavigationMenuItemMovedPosition({ siblings, itemId: 'a', offset: -1 }),
    ).toBeNull();
    expect(
      getNavigationMenuItemMovedPosition({ siblings, itemId: 'c', offset: 1 }),
    ).toBeNull();
  });
});
