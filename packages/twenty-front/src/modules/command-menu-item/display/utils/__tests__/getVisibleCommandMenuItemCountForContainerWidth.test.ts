import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/display/utils/getVisibleCommandMenuItemCountForContainerWidth';

describe('getVisibleCommandMenuItemCountForContainerWidth', () => {
  it('should return all items when container width is zero', () => {
    const visibleCommandMenuItemCount =
      getVisibleCommandMenuItemCountForContainerWidth({
        commandMenuItemKeysInDisplayOrder: ['a', 'b', 'c'],
        commandMenuItemWidthsByKey: { a: 20, b: 20, c: 20 },
        commandMenuItemsContainerWidth: 0,
        commandMenuItemsGapWidth: 8,
      });

    expect(visibleCommandMenuItemCount).toBe(3);
  });

  it('should return all items when at least one width is missing', () => {
    const visibleCommandMenuItemCount =
      getVisibleCommandMenuItemCountForContainerWidth({
        commandMenuItemKeysInDisplayOrder: ['a', 'b'],
        commandMenuItemWidthsByKey: { a: 20 },
        commandMenuItemsContainerWidth: 40,
        commandMenuItemsGapWidth: 8,
      });

    expect(visibleCommandMenuItemCount).toBe(2);
  });

  it('should stop before exceeding the container width with gaps', () => {
    const visibleCommandMenuItemCount =
      getVisibleCommandMenuItemCountForContainerWidth({
        commandMenuItemKeysInDisplayOrder: ['a', 'b', 'c'],
        commandMenuItemWidthsByKey: { a: 40, b: 40, c: 40 },
        commandMenuItemsContainerWidth: 100,
        commandMenuItemsGapWidth: 8,
      });

    expect(visibleCommandMenuItemCount).toBe(2);
  });
});
