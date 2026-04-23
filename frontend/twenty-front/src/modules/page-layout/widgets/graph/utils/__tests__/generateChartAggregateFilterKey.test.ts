import { generateChartAggregateFilterKey } from '@/page-layout/widgets/graph/utils/generateChartAggregateFilterKey';

describe('generateChartAggregateFilterKey', () => {
  it('should generate key with all values provided', () => {
    const result = generateChartAggregateFilterKey(0, 100, true);

    expect(result).toBe('0-100-true');
  });

  it('should generate key with negative values', () => {
    const result = generateChartAggregateFilterKey(-50, 50, false);

    expect(result).toBe('-50-50-false');
  });

  it('should handle undefined values as empty strings', () => {
    const result = generateChartAggregateFilterKey(
      undefined,
      undefined,
      undefined,
    );

    expect(result).toBe('--');
  });

  it('should handle null values as empty strings', () => {
    const result = generateChartAggregateFilterKey(null, null, null);

    expect(result).toBe('--');
  });

  it('should handle mixed defined and undefined values', () => {
    const result = generateChartAggregateFilterKey(10, undefined, true);

    expect(result).toBe('10--true');
  });

  it('should handle zero as valid value', () => {
    const result = generateChartAggregateFilterKey(0, 0, false);

    expect(result).toBe('0-0-false');
  });

  it('should handle no arguments', () => {
    const result = generateChartAggregateFilterKey();

    expect(result).toBe('--');
  });

  it('should handle decimal values', () => {
    const result = generateChartAggregateFilterKey(10.5, 99.9, true);

    expect(result).toBe('10.5-99.9-true');
  });
});
