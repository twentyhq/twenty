import { type Layouts } from 'react-grid-layout';
import { updateLayoutItemConstraints } from '@/page-layout/utils/updateLayoutItemConstraints';

describe('updateLayoutItemConstraints', () => {
  it('should update constraints for the specified layout item in desktop layout', () => {
    const layouts: Layouts = {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        { i: 'widget-2', x: 4, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
      ],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-1', {
      minW: 3,
      minH: 4,
    });

    expect(result.desktop?.[0]).toEqual({
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      minW: 3,
      minH: 4,
    });
    expect(result.desktop?.[1]).toEqual({
      i: 'widget-2',
      x: 4,
      y: 0,
      w: 4,
      h: 3,
      minW: 2,
      minH: 2,
    });
  });

  it('should update constraints for the specified layout item in mobile layout', () => {
    const layouts: Layouts = {
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
        { i: 'widget-2', x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 1 },
      ],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-2', {
      minW: 2,
      minH: 3,
    });

    expect(result.mobile?.[0]).toEqual({
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      minW: 1,
      minH: 1,
    });
    expect(result.mobile?.[1]).toEqual({
      i: 'widget-2',
      x: 0,
      y: 2,
      w: 2,
      h: 2,
      minW: 2,
      minH: 3,
    });
  });

  it('should update constraints in both desktop and mobile layouts when item exists in both', () => {
    const layouts: Layouts = {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        { i: 'widget-2', x: 4, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
      ],
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
        { i: 'widget-2', x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 1 },
      ],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-1', {
      minW: 5,
      minH: 6,
    });

    expect(result.desktop?.[0].minW).toBe(5);
    expect(result.desktop?.[0].minH).toBe(6);
    expect(result.mobile?.[0].minW).toBe(5);
    expect(result.mobile?.[0].minH).toBe(6);
  });

  it('should not modify layouts when layout item does not exist', () => {
    const layouts: Layouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 }],
    };

    const result = updateLayoutItemConstraints(layouts, 'non-existent', {
      minW: 10,
      minH: 10,
    });

    expect(result.desktop).toEqual(layouts.desktop);
    expect(result.mobile).toEqual(layouts.mobile);
  });

  it('should handle undefined desktop layout', () => {
    const layouts: Layouts = {
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 }],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-1', {
      minW: 3,
      minH: 3,
    });

    expect(result.desktop).toBeUndefined();
    expect(result.mobile?.[0].minW).toBe(3);
    expect(result.mobile?.[0].minH).toBe(3);
  });

  it('should handle undefined mobile layout', () => {
    const layouts: Layouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 }],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-1', {
      minW: 4,
      minH: 5,
    });

    expect(result.desktop?.[0].minW).toBe(4);
    expect(result.desktop?.[0].minH).toBe(5);
    expect(result.mobile).toBeUndefined();
  });

  it('should handle empty layouts object', () => {
    const layouts: Layouts = {};

    const result = updateLayoutItemConstraints(layouts, 'widget-1', {
      minW: 3,
      minH: 3,
    });

    expect(result).toEqual({});
  });

  it('should preserve other properties of layout items', () => {
    const layouts: Layouts = {
      desktop: [
        {
          i: 'widget-1',
          x: 0,
          y: 0,
          w: 4,
          h: 3,
          minW: 2,
          minH: 2,
          static: true,
          isDraggable: false,
        },
      ],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-1', {
      minW: 5,
      minH: 5,
    });

    expect(result.desktop?.[0]).toEqual({
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      minW: 5,
      minH: 5,
      static: true,
      isDraggable: false,
    });
  });

  it('should handle layouts with multiple widgets and only update the target', () => {
    const layouts: Layouts = {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        { i: 'widget-2', x: 4, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        { i: 'widget-3', x: 0, y: 3, w: 8, h: 2, minW: 3, minH: 1 },
      ],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-2', {
      minW: 6,
      minH: 4,
    });

    expect(result.desktop?.[0].minW).toBe(2);
    expect(result.desktop?.[0].minH).toBe(2);
    expect(result.desktop?.[1].minW).toBe(6);
    expect(result.desktop?.[1].minH).toBe(4);
    expect(result.desktop?.[2].minW).toBe(3);
    expect(result.desktop?.[2].minH).toBe(1);
  });

  it('should handle constraints with zero values', () => {
    const layouts: Layouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 }],
    };

    const result = updateLayoutItemConstraints(layouts, 'widget-1', {
      minW: 0,
      minH: 0,
    });

    expect(result.desktop?.[0].minW).toBe(0);
    expect(result.desktop?.[0].minH).toBe(0);
  });
});
