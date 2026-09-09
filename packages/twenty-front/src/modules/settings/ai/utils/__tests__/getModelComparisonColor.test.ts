import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getModelComparisonColor } from '@/settings/ai/utils/getModelComparisonColor';

describe('getModelComparisonColor', () => {
  it('ranks ordinary performance from orange through lime to green', () => {
    expect(
      getModelComparisonColor({ value: 10, comparisonValues: [10, 20, 30] }),
    ).toBe(themeCssVariables.color.orange9);
    expect(
      getModelComparisonColor({ value: 20, comparisonValues: [10, 20, 30] }),
    ).toBe(themeCssVariables.color.lime9);
    expect(
      getModelComparisonColor({ value: 30, comparisonValues: [10, 20, 30] }),
    ).toBe(themeCssVariables.color.green9);
  });

  it('reverses the scale for costs and includes free models', () => {
    expect(
      getModelComparisonColor({
        value: 0,
        comparisonValues: [0, 20, 30],
        lowerIsBetter: true,
      }),
    ).toBe(themeCssVariables.color.green9);
    expect(
      getModelComparisonColor({
        value: 30,
        comparisonValues: [0, 20, 30],
        lowerIsBetter: true,
      }),
    ).toBe(themeCssVariables.color.orange9);
  });

  it('adapts to new models and treats ties equally', () => {
    expect(
      getModelComparisonColor({ value: 20, comparisonValues: [10, 20] }),
    ).toBe(themeCssVariables.color.green9);
    expect(
      getModelComparisonColor({
        value: 20,
        comparisonValues: [10, 20, 30, 40, 50],
      }),
    ).toBe(themeCssVariables.color.yellow9);
    expect(
      getModelComparisonColor({
        value: 20,
        comparisonValues: [10, 20, 20, 30],
      }),
    ).toBe(themeCssVariables.color.lime9);
  });

  it('uses grass for above-average performance', () => {
    expect(
      getModelComparisonColor({
        value: 40,
        comparisonValues: [10, 20, 30, 40, 50],
      }),
    ).toBe(themeCssVariables.color.grass9);
  });

  it('reserves red for extreme outliers in the bottom five percent', () => {
    expect(
      getModelComparisonColor({ value: 1, comparisonValues: [1, 50, 60] }),
    ).toBe(themeCssVariables.color.red9);
    expect(
      getModelComparisonColor({
        value: 100,
        comparisonValues: [1, 2, 100],
        lowerIsBetter: true,
      }),
    ).toBe(themeCssVariables.color.red9);
    expect(
      getModelComparisonColor({ value: 50, comparisonValues: [50, 51, 52] }),
    ).toBe(themeCssVariables.color.orange9);
    expect(
      getModelComparisonColor({
        value: 10,
        comparisonValues: [1, 10, 100, 110, 120],
      }),
    ).toBe(themeCssVariables.color.yellow9);
  });

  it('uses neutral color without meaningful comparison data', () => {
    for (const values of [[], [20], [20, 20], [NaN, 20], [10, 30]]) {
      expect(
        getModelComparisonColor({ value: 20, comparisonValues: values }),
      ).toBe(themeCssVariables.font.color.tertiary);
    }
  });
});
