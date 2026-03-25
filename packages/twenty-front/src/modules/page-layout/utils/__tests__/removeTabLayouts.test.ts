import { removeTabLayouts } from '@/page-layout/utils/removeTabLayouts';

describe('removeTabLayouts', () => {
  it('should remove the specified tab and return the rest', () => {
    const allTabLayouts = {
      'tab-1': { lg: [], md: [] },
      'tab-2': { lg: [], md: [] },
      'tab-3': { lg: [], md: [] },
    };

    const result = removeTabLayouts(allTabLayouts, 'tab-2');

    expect(result).toEqual({
      'tab-1': { lg: [], md: [] },
      'tab-3': { lg: [], md: [] },
    });
    expect(result).not.toHaveProperty('tab-2');
  });

  it('should return the same object reference when tab does not exist', () => {
    const allTabLayouts = {
      'tab-1': { lg: [], md: [] },
    };

    const result = removeTabLayouts(allTabLayouts, 'non-existent');

    expect(result).toBe(allTabLayouts);
  });

  it('should return empty object when removing the only tab', () => {
    const allTabLayouts = {
      'tab-1': { lg: [], md: [] },
    };

    const result = removeTabLayouts(allTabLayouts, 'tab-1');

    expect(result).toEqual({});
  });

  it('should not mutate the original object', () => {
    const allTabLayouts = {
      'tab-1': { lg: [], md: [] },
      'tab-2': { lg: [], md: [] },
    };

    removeTabLayouts(allTabLayouts, 'tab-1');

    expect(allTabLayouts).toHaveProperty('tab-1');
    expect(allTabLayouts).toHaveProperty('tab-2');
  });
});
