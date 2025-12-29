import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';

describe('getUpdatedTabLayouts', () => {
  const mockTabLayouts: TabLayouts = {
    'tab-1': {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 1, h: 2 }],
    },
    'tab-2': {
      desktop: [],
      mobile: [],
    },
  };

  const newLayout = { i: 'widget-2', x: 2, y: 0, w: 3, h: 3 };

  it('should add new layout to existing tab', () => {
    const result = getUpdatedTabLayouts(mockTabLayouts, 'tab-1', newLayout);

    expect(result['tab-1'].desktop).toHaveLength(2);
    expect(result['tab-1'].desktop[1]).toEqual(newLayout);
    expect(result['tab-1'].mobile).toHaveLength(2);
    expect(result['tab-1'].mobile[1]).toEqual({ ...newLayout, w: 1, x: 0 });
  });

  it('should add layout to empty tab', () => {
    const result = getUpdatedTabLayouts(mockTabLayouts, 'tab-2', newLayout);

    expect(result['tab-2'].desktop).toHaveLength(1);
    expect(result['tab-2'].desktop[0]).toEqual(newLayout);
    expect(result['tab-2'].mobile).toHaveLength(1);
    expect(result['tab-2'].mobile[0]).toEqual({ ...newLayout, w: 1, x: 0 });
  });

  it('should create new tab entry if tab does not exist', () => {
    const result = getUpdatedTabLayouts(mockTabLayouts, 'tab-3', newLayout);

    expect(result['tab-3']).toBeDefined();
    expect(result['tab-3'].desktop).toHaveLength(1);
    expect(result['tab-3'].desktop[0]).toEqual(newLayout);
    expect(result['tab-3'].mobile).toHaveLength(1);
  });

  it('should not modify other tabs', () => {
    const result = getUpdatedTabLayouts(mockTabLayouts, 'tab-1', newLayout);

    expect(result['tab-2']).toEqual(mockTabLayouts['tab-2']);
  });

  it('should handle mobile layout transformation correctly', () => {
    const wideLayout = { i: 'widget-3', x: 5, y: 2, w: 6, h: 4 };
    const result = getUpdatedTabLayouts(mockTabLayouts, 'tab-1', wideLayout);

    const mobileLayout =
      result['tab-1'].mobile[result['tab-1'].mobile.length - 1];
    expect(mobileLayout.w).toBe(1);
    expect(mobileLayout.x).toBe(0);
    expect(mobileLayout.y).toBe(wideLayout.y);
    expect(mobileLayout.h).toBe(wideLayout.h);
  });

  it('should return a new object without mutating the original', () => {
    const originalLayouts = JSON.parse(JSON.stringify(mockTabLayouts));
    const result = getUpdatedTabLayouts(mockTabLayouts, 'tab-1', newLayout);

    expect(result).not.toBe(mockTabLayouts);
    expect(mockTabLayouts).toEqual(originalLayouts);
    expect(result['tab-1'].desktop).toHaveLength(2);
    expect(mockTabLayouts['tab-1'].desktop).toHaveLength(1);
  });

  it('should throw an error for malformed tab layouts', () => {
    const malformedLayouts: TabLayouts = {
      'tab-1': {} as any,
    };

    expect(() => {
      getUpdatedTabLayouts(malformedLayouts, 'tab-1', newLayout);
    }).toThrow();
  });
});
