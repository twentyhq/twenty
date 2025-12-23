import { computeRatioDisplayValue } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/computeRatioDisplayValue';

describe('computeRatioDisplayValue', () => {
  it('should return "0%" when denominator is 0', () => {
    const result = computeRatioDisplayValue({
      numeratorCount: 10,
      denominatorCount: 0,
    });

    expect(result).toBe('0%');
  });

  it('should return whole number without decimal when ratio is exact', () => {
    const result = computeRatioDisplayValue({
      numeratorCount: 50,
      denominatorCount: 100,
    });

    expect(result).toBe('50%');
  });

  it('should return one decimal place when ratio has decimals', () => {
    const result = computeRatioDisplayValue({
      numeratorCount: 1,
      denominatorCount: 3,
    });

    expect(result).toBe('33.3%');
  });

  it('should return "100%" when numerator equals denominator', () => {
    const result = computeRatioDisplayValue({
      numeratorCount: 100,
      denominatorCount: 100,
    });

    expect(result).toBe('100%');
  });

  it('should handle small percentages', () => {
    const result = computeRatioDisplayValue({
      numeratorCount: 1,
      denominatorCount: 200,
    });

    expect(result).toBe('0.5%');
  });

  it('should return "0%" when numerator is 0', () => {
    const result = computeRatioDisplayValue({
      numeratorCount: 0,
      denominatorCount: 100,
    });

    expect(result).toBe('0%');
  });
});
