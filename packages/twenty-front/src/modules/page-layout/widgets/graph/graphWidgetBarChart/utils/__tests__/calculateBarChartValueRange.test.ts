import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { calculateBarChartValueRange } from '../calculateBarChartValueRange';

describe('calculateBarChartValueRange', () => {
  describe('all positive values', () => {
    it('should return min=0 and max=highest value when all values are positive', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: 10, value2: 20 },
        { category: 'B', value1: 30, value2: 15 },
        { category: 'C', value1: 25, value2: 40 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: 0,
        max: 40,
      });
    });

    it('should handle single positive value', () => {
      const data: BarChartDataItem[] = [{ category: 'A', value: 100 }];
      const keys = ['value'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: 0,
        max: 100,
      });
    });
  });

  describe('all negative values', () => {
    it('should return min=lowest value and max=0 when all values are negative', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: -10, value2: -20 },
        { category: 'B', value1: -30, value2: -15 },
        { category: 'C', value1: -25, value2: -40 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -40,
        max: 0,
      });
    });

    it('should handle single negative value', () => {
      const data: BarChartDataItem[] = [{ category: 'A', value: -50 }];
      const keys = ['value'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -50,
        max: 0,
      });
    });
  });

  describe('mixed positive and negative values', () => {
    it('should include zero in range when values cross zero', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: -20, value2: 30 },
        { category: 'B', value1: 15, value2: -10 },
        { category: 'C', value1: -5, value2: 25 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -20,
        max: 30,
      });
    });

    it('should handle values with zero included in data', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: 0, value2: 10 },
        { category: 'B', value1: -5, value2: 0 },
        { category: 'C', value1: 5, value2: -10 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -10,
        max: 10,
      });
    });

    it('should handle mostly negative with small positive', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: -100, value2: -80 },
        { category: 'B', value1: -50, value2: 5 },
        { category: 'C', value1: -75, value2: -90 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -100,
        max: 5,
      });
    });

    it('should handle mostly positive with small negative', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: 100, value2: 80 },
        { category: 'B', value1: 50, value2: -5 },
        { category: 'C', value1: 75, value2: 90 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -5,
        max: 100,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty data array', () => {
      const data: BarChartDataItem[] = [];
      const keys = ['value'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: 0,
        max: 0,
      });
    });

    it('should handle empty keys array', () => {
      const data: BarChartDataItem[] = [{ category: 'A', value: 10 }];
      const keys: string[] = [];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: 0,
        max: 0,
      });
    });

    it('should handle missing values (undefined)', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: 10 },
        { category: 'B', value1: 20, value2: 30 },
        { category: 'C', value2: 40 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: 0,
        max: 40,
      });
    });

    it('should ignore NaN values', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: 10, value2: NaN },
        { category: 'B', value1: 20, value2: 30 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: 0,
        max: 30,
      });
    });

    it('should handle multiple series with different ranges', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', sales: 1000, profit: -50, growth: 5.5 },
        { category: 'B', sales: 2000, profit: 200, growth: -2.3 },
        { category: 'C', sales: 1500, profit: 100, growth: 8.1 },
      ];
      const keys = ['sales', 'profit', 'growth'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -50,
        max: 2000,
      });
    });

    it('should handle decimal values', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: 10.5, value2: -5.25 },
        { category: 'B', value1: 15.75, value2: -10.5 },
        { category: 'C', value1: 8.3, value2: -3.8 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -10.5,
        max: 15.75,
      });
    });

    it('should handle very large numbers', () => {
      const data: BarChartDataItem[] = [
        { category: 'A', value1: 1000000, value2: -500000 },
        { category: 'B', value1: 2000000, value2: -1000000 },
      ];
      const keys = ['value1', 'value2'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -1000000,
        max: 2000000,
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle profit/loss financial data', () => {
      const data: BarChartDataItem[] = [
        { quarter: 'Q1', profit: -50000 },
        { quarter: 'Q2', profit: -20000 },
        { quarter: 'Q3', profit: 10000 },
        { quarter: 'Q4', profit: 80000 },
      ];
      const keys = ['profit'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -50000,
        max: 80000,
      });
    });

    it('should handle temperature data (can be negative)', () => {
      const data: BarChartDataItem[] = [
        { month: 'Jan', temp: -5 },
        { month: 'Feb', temp: -2 },
        { month: 'Mar', temp: 5 },
        { month: 'Apr', temp: 15 },
      ];
      const keys = ['temp'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -5,
        max: 15,
      });
    });

    it('should handle percentage changes (can be negative)', () => {
      const data: BarChartDataItem[] = [
        { metric: 'A', change: -15.5 },
        { metric: 'B', change: 8.2 },
        { metric: 'C', change: -3.7 },
        { metric: 'D', change: 12.1 },
      ];
      const keys = ['change'];

      const result = calculateBarChartValueRange(data, keys);

      expect(result).toEqual({
        min: -15.5,
        max: 12.1,
      });
    });
  });
});
