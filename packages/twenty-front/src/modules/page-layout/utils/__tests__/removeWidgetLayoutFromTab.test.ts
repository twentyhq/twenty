import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';

describe('removeWidgetLayoutFromTab', () => {
  const mockTabLayouts: TabLayouts = {
    'tab-1': {
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 2, h: 2 },
        { i: 'widget-2', x: 2, y: 0, w: 3, h: 3 },
        { i: 'widget-3', x: 5, y: 0, w: 2, h: 2 },
      ],
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 1, h: 2 },
        { i: 'widget-2', x: 0, y: 2, w: 1, h: 3 },
        { i: 'widget-3', x: 0, y: 5, w: 1, h: 2 },
      ],
    },
    'tab-2': {
      desktop: [{ i: 'widget-4', x: 0, y: 0, w: 4, h: 4 }],
      mobile: [{ i: 'widget-4', x: 0, y: 0, w: 1, h: 4 }],
    },
  };

  it('should remove widget layout from the correct tab', () => {
    const result = removeWidgetLayoutFromTab(
      mockTabLayouts,
      'tab-1',
      'widget-2',
    );

    expect(result['tab-1'].desktop).toHaveLength(2);
    expect(result['tab-1'].desktop.map((l) => l.i)).toEqual([
      'widget-1',
      'widget-3',
    ]);
    expect(result['tab-1'].mobile).toHaveLength(2);
    expect(result['tab-1'].mobile.map((l) => l.i)).toEqual([
      'widget-1',
      'widget-3',
    ]);
  });

  it('should not affect other tabs', () => {
    const result = removeWidgetLayoutFromTab(
      mockTabLayouts,
      'tab-1',
      'widget-1',
    );

    expect(result['tab-2']).toEqual(mockTabLayouts['tab-2']);
    expect(result['tab-2'].desktop).toHaveLength(1);
  });

  it('should handle non-existent tab gracefully', () => {
    const result = removeWidgetLayoutFromTab(
      mockTabLayouts,
      'non-existent',
      'widget-1',
    );

    expect(result).toEqual(mockTabLayouts);
  });

  it('should handle non-existent widget gracefully', () => {
    const result = removeWidgetLayoutFromTab(
      mockTabLayouts,
      'tab-1',
      'non-existent',
    );

    expect(result['tab-1'].desktop).toHaveLength(3);
    expect(result['tab-1']).toEqual(mockTabLayouts['tab-1']);
  });

  it('should remove all widgets from a tab', () => {
    let result = removeWidgetLayoutFromTab(mockTabLayouts, 'tab-1', 'widget-1');
    result = removeWidgetLayoutFromTab(result, 'tab-1', 'widget-2');
    result = removeWidgetLayoutFromTab(result, 'tab-1', 'widget-3');

    expect(result['tab-1'].desktop).toHaveLength(0);
    expect(result['tab-1'].mobile).toHaveLength(0);
  });

  it('should handle empty tab layouts', () => {
    const emptyLayouts: TabLayouts = {
      'tab-1': {
        desktop: [],
        mobile: [],
      },
    };

    const result = removeWidgetLayoutFromTab(emptyLayouts, 'tab-1', 'widget-1');

    expect(result['tab-1'].desktop).toHaveLength(0);
    expect(result['tab-1'].mobile).toHaveLength(0);
  });

  it('should return a new object without mutating the original', () => {
    const originalLayouts = JSON.parse(JSON.stringify(mockTabLayouts));
    const result = removeWidgetLayoutFromTab(
      mockTabLayouts,
      'tab-1',
      'widget-1',
    );

    expect(result).not.toBe(mockTabLayouts);
    expect(mockTabLayouts).toEqual(originalLayouts);
    expect(result['tab-1'].desktop).toHaveLength(2);
    expect(mockTabLayouts['tab-1'].desktop).toHaveLength(3);
  });

  it('should remove widget from both desktop and mobile layouts', () => {
    const result = removeWidgetLayoutFromTab(
      mockTabLayouts,
      'tab-1',
      'widget-2',
    );

    const desktopIds = result['tab-1'].desktop.map((l) => l.i);
    const mobileIds = result['tab-1'].mobile.map((l) => l.i);

    expect(desktopIds).not.toContain('widget-2');
    expect(mobileIds).not.toContain('widget-2');
    expect(desktopIds).toEqual(mobileIds);
  });
});
