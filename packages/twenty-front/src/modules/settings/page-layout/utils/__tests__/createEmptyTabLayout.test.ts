import { type TabLayouts } from '../../states/pageLayoutCurrentLayoutsState';
import { createEmptyTabLayout } from '../createEmptyTabLayout';

describe('createEmptyTabLayout', () => {
  const mockTabLayouts: TabLayouts = {
    'tab-1': {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 1, h: 2 }],
    },
    'tab-2': {
      desktop: [{ i: 'widget-2', x: 0, y: 0, w: 3, h: 3 }],
      mobile: [{ i: 'widget-2', x: 0, y: 0, w: 1, h: 3 }],
    },
  };

  it('should create empty layout for a new tab', () => {
    const result = createEmptyTabLayout(mockTabLayouts, 'tab-3');

    expect(result['tab-3']).toBeDefined();
    expect(result['tab-3'].desktop).toEqual([]);
    expect(result['tab-3'].mobile).toEqual([]);
  });

  it('should preserve existing tabs', () => {
    const result = createEmptyTabLayout(mockTabLayouts, 'tab-3');

    expect(result['tab-1']).toEqual(mockTabLayouts['tab-1']);
    expect(result['tab-2']).toEqual(mockTabLayouts['tab-2']);
    expect(Object.keys(result)).toHaveLength(3);
  });

  it('should overwrite existing tab with empty layout', () => {
    const result = createEmptyTabLayout(mockTabLayouts, 'tab-1');

    expect(result['tab-1'].desktop).toEqual([]);
    expect(result['tab-1'].mobile).toEqual([]);
    expect(result['tab-2']).toEqual(mockTabLayouts['tab-2']);
  });

  it('should work with empty initial state', () => {
    const emptyLayouts: TabLayouts = {};
    const result = createEmptyTabLayout(emptyLayouts, 'tab-1');

    expect(result['tab-1']).toBeDefined();
    expect(result['tab-1'].desktop).toEqual([]);
    expect(result['tab-1'].mobile).toEqual([]);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should return a new object without mutating the original', () => {
    const originalLayouts = JSON.parse(JSON.stringify(mockTabLayouts));
    const result = createEmptyTabLayout(mockTabLayouts, 'tab-3');

    expect(result).not.toBe(mockTabLayouts);
    expect(mockTabLayouts).toEqual(originalLayouts);
    expect(Object.keys(mockTabLayouts)).toHaveLength(2);
    expect(Object.keys(result)).toHaveLength(3);
  });

  it('should handle multiple new tabs', () => {
    let result = createEmptyTabLayout(mockTabLayouts, 'tab-3');
    result = createEmptyTabLayout(result, 'tab-4');
    result = createEmptyTabLayout(result, 'tab-5');

    expect(Object.keys(result)).toHaveLength(5);
    expect(result['tab-3'].desktop).toEqual([]);
    expect(result['tab-4'].desktop).toEqual([]);
    expect(result['tab-5'].desktop).toEqual([]);
  });

  it('should create consistent structure for desktop and mobile', () => {
    const result = createEmptyTabLayout(mockTabLayouts, 'new-tab');

    expect(result['new-tab']).toHaveProperty('desktop');
    expect(result['new-tab']).toHaveProperty('mobile');
    expect(Array.isArray(result['new-tab'].desktop)).toBe(true);
    expect(Array.isArray(result['new-tab'].mobile)).toBe(true);
  });
});
