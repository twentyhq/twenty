import { calculatePieChartPercentage } from '../calculatePieChartPercentage';
describe('calculatePieChartPercentage', () => {
  it('should calculate percentage for normal values', () => {
    expect(calculatePieChartPercentage(25, 100)).toBe(25);
    expect(calculatePieChartPercentage(50, 100)).toBe(50);
    expect(calculatePieChartPercentage(75, 100)).toBe(75);
  });
  it('should calculate percentage with decimal values', () => {
    expect(calculatePieChartPercentage(33, 100)).toBe(33);
    expect(calculatePieChartPercentage(1, 3)).toBeCloseTo(33.333, 2);
    expect(calculatePieChartPercentage(2, 3)).toBeCloseTo(66.667, 2);
  });
  it('should handle zero value', () => {
    expect(calculatePieChartPercentage(0, 100)).toBe(0);
    expect(calculatePieChartPercentage(0, 1)).toBe(0);
  });
  it('should handle zero total (divide by zero)', () => {
    expect(calculatePieChartPercentage(10, 0)).toBe(0);
    expect(calculatePieChartPercentage(0, 0)).toBe(0);
    expect(calculatePieChartPercentage(-5, 0)).toBe(0);
  });
  it('should handle negative total', () => {
    expect(calculatePieChartPercentage(10, -100)).toBe(0);
    expect(calculatePieChartPercentage(-10, -100)).toBe(0);
  });
  it('should handle value greater than total', () => {
    expect(calculatePieChartPercentage(150, 100)).toBe(150);
    expect(calculatePieChartPercentage(200, 50)).toBe(400);
  });
  it('should handle very small values', () => {
    expect(calculatePieChartPercentage(0.01, 100)).toBe(0.01);
    expect(calculatePieChartPercentage(0.001, 1)).toBe(0.1);
  });
  it('should handle very large values', () => {
    expect(calculatePieChartPercentage(1000000, 10000000)).toBe(10);
    expect(calculatePieChartPercentage(1e10, 1e12)).toBe(1);
  });
  it('should maintain precision for financial calculations', () => {
    const value1 = 33.33;
    const value2 = 33.33;
    const value3 = 33.34;
    const total = value1 + value2 + value3;
    expect(calculatePieChartPercentage(value1, total)).toBeCloseTo(33.33, 2);
    expect(calculatePieChartPercentage(value2, total)).toBeCloseTo(33.33, 2);
    expect(calculatePieChartPercentage(value3, total)).toBeCloseTo(33.34, 2);
  });
  it('should handle edge case with Infinity', () => {
    expect(calculatePieChartPercentage(Infinity, 100)).toBe(Infinity);
    expect(calculatePieChartPercentage(100, Infinity)).toBe(0);
    expect(calculatePieChartPercentage(Infinity, Infinity)).toBeNaN();
  });
  it('should handle NaN inputs', () => {
    expect(calculatePieChartPercentage(NaN, 100)).toBeNaN();
    expect(calculatePieChartPercentage(100, NaN)).toBeNaN();
    expect(calculatePieChartPercentage(NaN, NaN)).toBeNaN();
  });
});
