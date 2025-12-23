import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import { type Layouts } from 'react-grid-layout';
import { filterPendingPlaceholderFromLayouts } from '@/page-layout/utils/filterPendingPlaceholderFromLayouts';

describe('filterPendingPlaceholderFromLayouts', () => {
  it('should remove pending placeholder from both desktop and mobile layouts', () => {
    const layouts: Layouts = {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 4, y: 0, w: 4, h: 4 },
        { i: 'widget-2', x: 8, y: 0, w: 4, h: 4 },
      ],
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 1, h: 4 },
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 0, y: 4, w: 1, h: 4 },
        { i: 'widget-2', x: 0, y: 8, w: 1, h: 4 },
      ],
    };

    const result = filterPendingPlaceholderFromLayouts(layouts);

    expect(result.desktop).toHaveLength(2);
    expect(result.desktop).toEqual([
      { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
      { i: 'widget-2', x: 8, y: 0, w: 4, h: 4 },
    ]);

    expect(result.mobile).toHaveLength(2);
    expect(result.mobile).toEqual([
      { i: 'widget-1', x: 0, y: 0, w: 1, h: 4 },
      { i: 'widget-2', x: 0, y: 8, w: 1, h: 4 },
    ]);
  });

  it('should handle layouts with no pending placeholder', () => {
    const layouts: Layouts = {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
        { i: 'widget-2', x: 4, y: 0, w: 4, h: 4 },
      ],
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 1, h: 4 },
        { i: 'widget-2', x: 0, y: 4, w: 1, h: 4 },
      ],
    };

    const result = filterPendingPlaceholderFromLayouts(layouts);

    expect(result.desktop).toHaveLength(2);
    expect(result.desktop).toEqual(layouts.desktop);
    expect(result.mobile).toHaveLength(2);
    expect(result.mobile).toEqual(layouts.mobile);
  });

  it('should handle missing desktop or mobile layouts', () => {
    // Test with missing desktop property
    const layoutsWithoutDesktop = {
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 1, h: 4 },
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 0, y: 4, w: 1, h: 4 },
      ],
    } as Layouts;

    const result1 = filterPendingPlaceholderFromLayouts(layoutsWithoutDesktop);

    expect(result1.desktop).toBeUndefined();
    expect(result1.mobile).toHaveLength(1);
    expect(result1.mobile).toEqual([{ i: 'widget-1', x: 0, y: 0, w: 1, h: 4 }]);

    // Test with missing mobile property
    const layoutsWithoutMobile = {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 4, y: 0, w: 4, h: 4 },
      ],
    } as Layouts;

    const result2 = filterPendingPlaceholderFromLayouts(layoutsWithoutMobile);

    expect(result2.desktop).toHaveLength(1);
    expect(result2.desktop).toEqual([
      { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
    ]);
    expect(result2.mobile).toBeUndefined();
  });

  it('should handle empty layouts', () => {
    const emptyLayouts: Layouts = {
      desktop: [],
      mobile: [],
    };

    const result = filterPendingPlaceholderFromLayouts(emptyLayouts);

    expect(result.desktop).toEqual([]);
    expect(result.mobile).toEqual([]);
  });

  it('should handle layouts with only pending placeholder', () => {
    const layouts: Layouts = {
      desktop: [
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 0, y: 0, w: 4, h: 4 },
      ],
      mobile: [
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 0, y: 0, w: 1, h: 4 },
      ],
    };

    const result = filterPendingPlaceholderFromLayouts(layouts);

    expect(result.desktop).toEqual([]);
    expect(result.mobile).toEqual([]);
  });

  it('should not mutate the original layouts', () => {
    const layouts: Layouts = {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 4, y: 0, w: 4, h: 4 },
      ],
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 1, h: 4 },
        { i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY, x: 0, y: 4, w: 1, h: 4 },
      ],
    };

    const originalDesktopLength = layouts.desktop!.length;
    const originalMobileLength = layouts.mobile!.length;

    filterPendingPlaceholderFromLayouts(layouts);

    expect(layouts.desktop).toHaveLength(originalDesktopLength);
    expect(layouts.mobile).toHaveLength(originalMobileLength);
    expect(
      layouts.desktop!.some(
        (item) => item.i === PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
      ),
    ).toBe(true);
    expect(
      layouts.mobile!.some(
        (item) => item.i === PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
      ),
    ).toBe(true);
  });
});
