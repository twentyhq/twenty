import { ROTATION_THRESHOLD_WIDTH } from '@/page-layout/widgets/graph/constants/RotationThresholdWidth';
import { computeChartCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeChartCategoryTickValues';

describe('computeChartCategoryTickValues', () => {
  it('should return all values when available size allows', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    const result = computeChartCategoryTickValues({
      availableSize: 500,
      minimumSizePerTick: 100,
      values,
    });

    expect(result).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('should return subset of values when space is limited', () => {
    const values = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const result = computeChartCategoryTickValues({
      availableSize: 400,
      minimumSizePerTick: 100,
      values,
    });

    expect(result.length).toBe(4);
    expect(result).toEqual(['A', 'C', 'F', 'H']);
  });

  it('should return empty array when available size is zero', () => {
    const values = ['A', 'B', 'C'];
    const result = computeChartCategoryTickValues({
      availableSize: 0,
      minimumSizePerTick: 100,
      values,
    });

    expect(result).toEqual([]);
  });

  it('should return empty array when available size is negative', () => {
    const values = ['A', 'B', 'C'];
    const result = computeChartCategoryTickValues({
      availableSize: -100,
      minimumSizePerTick: 100,
      values,
    });

    expect(result).toEqual([]);
  });

  it('should return empty array when values array is empty', () => {
    const result = computeChartCategoryTickValues({
      availableSize: 500,
      minimumSizePerTick: 100,
      values: [],
    });

    expect(result).toEqual([]);
  });

  it('should handle single value', () => {
    const values = ['A'];
    const result = computeChartCategoryTickValues({
      availableSize: 500,
      minimumSizePerTick: 100,
      values,
    });

    expect(result).toEqual(['A']);
  });

  it('should work with numeric values', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = computeChartCategoryTickValues({
      availableSize: 300,
      minimumSizePerTick: 100,
      values,
    });

    expect(result.length).toBe(3);
    expect(result).toEqual([1, 5, 8]);
  });

  it('should handle very small available size', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    const result = computeChartCategoryTickValues({
      availableSize: 50,
      minimumSizePerTick: 100,
      values,
    });

    expect(result).toEqual([]);
  });

  describe('with widthPerTick parameter', () => {
    it('should return all values when widthPerTick is above rotation threshold', () => {
      const values = ['A', 'B', 'C', 'D', 'E'];
      const result = computeChartCategoryTickValues({
        availableSize: 200,
        minimumSizePerTick: 100,
        values,
        widthPerTick: ROTATION_THRESHOLD_WIDTH + 10,
      });

      expect(result).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('should return all values when rotated and widthPerTick exceeds minimumSizePerTick', () => {
      const values = ['A', 'B', 'C', 'D', 'E'];
      const result = computeChartCategoryTickValues({
        availableSize: 200,
        minimumSizePerTick: 20,
        values,
        widthPerTick: 30,
      });

      expect(result).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('should omit ticks when rotated and widthPerTick is below minimumSizePerTick', () => {
      const values = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const result = computeChartCategoryTickValues({
        availableSize: 400,
        minimumSizePerTick: 100,
        values,
        widthPerTick: 10,
      });

      expect(result.length).toBe(4);
      expect(result).toEqual(['A', 'C', 'F', 'H']);
    });

    it('should behave like no widthPerTick when widthPerTick is undefined', () => {
      const values = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const resultWithoutWidthPerTick = computeChartCategoryTickValues({
        availableSize: 400,
        minimumSizePerTick: 100,
        values,
      });
      const resultWithUndefined = computeChartCategoryTickValues({
        availableSize: 400,
        minimumSizePerTick: 100,
        values,
        widthPerTick: undefined,
      });

      expect(resultWithoutWidthPerTick).toEqual(resultWithUndefined);
    });
  });
});
