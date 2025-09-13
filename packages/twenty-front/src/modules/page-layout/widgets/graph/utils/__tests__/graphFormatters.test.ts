import { formatGraphValue } from '../graphFormatters';
describe('formatGraphValue', () => {
  describe('number formatting', () => {
    it('should format regular numbers with default settings', () => {
      expect(formatGraphValue(1234.567)).toBe('1,235');
      expect(formatGraphValue(1000000)).toBe('1,000,000');
      expect(formatGraphValue(0)).toBe('0');
    });
    it('should format numbers with specified decimals', () => {
      expect(formatGraphValue(1234.567, { decimals: 2 })).toBe('1,234.57');
      expect(formatGraphValue(1234.567, { decimals: 0 })).toBe('1,235');
      expect(formatGraphValue(1234.567, { decimals: 3 })).toBe('1,234.567');
    });
    it('should handle prefix and suffix', () => {
      expect(formatGraphValue(100, { prefix: '~' })).toBe('~100');
      expect(formatGraphValue(100, { suffix: ' items' })).toBe('100 items');
      expect(formatGraphValue(100, { prefix: '~', suffix: ' items' })).toBe(
        '~100 items',
      );
    });
    it('should handle negative numbers', () => {
      expect(formatGraphValue(-1234.5)).toBe('-1,235');
      expect(formatGraphValue(-1234.5, { decimals: 1 })).toBe('-1,234.5');
    });
    it('should handle very small numbers', () => {
      expect(formatGraphValue(0.001, { decimals: 3 })).toBe('0.001');
      expect(formatGraphValue(0.001, { decimals: 2 })).toBe('0.00');
    });
  });
  describe('percentage formatting', () => {
    it('should format percentages correctly', () => {
      expect(formatGraphValue(0.75, { displayType: 'percentage' })).toBe('75%');
      expect(formatGraphValue(1, { displayType: 'percentage' })).toBe('100%');
      expect(formatGraphValue(0, { displayType: 'percentage' })).toBe('0%');
    });
    it('should format percentages with decimals', () => {
      expect(
        formatGraphValue(0.7534, { displayType: 'percentage', decimals: 2 }),
      ).toBe('75.34%');
      expect(
        formatGraphValue(0.7534, { displayType: 'percentage', decimals: 0 }),
      ).toBe('75%');
    });
    it('should handle percentages over 100%', () => {
      expect(formatGraphValue(1.5, { displayType: 'percentage' })).toBe('150%');
      expect(formatGraphValue(2.25, { displayType: 'percentage' })).toBe(
        '225%',
      );
    });
    it('should handle negative percentages', () => {
      expect(formatGraphValue(-0.25, { displayType: 'percentage' })).toBe(
        '-25%',
      );
    });
  });
  describe('currency formatting', () => {
    it('should format currency with default $ prefix', () => {
      expect(formatGraphValue(1234.5, { displayType: 'currency' })).toBe(
        '$1,235',
      );
      expect(
        formatGraphValue(1234.5, { displayType: 'currency', decimals: 2 }),
      ).toBe('$1,234.50');
    });
    it('should format currency with custom prefix', () => {
      expect(
        formatGraphValue(1234.5, {
          displayType: 'currency',
          prefix: '€',
          decimals: 2,
        }),
      ).toBe('€1,234.50');
      expect(
        formatGraphValue(1234.5, {
          displayType: 'currency',
          prefix: '£',
        }),
      ).toBe('£1,235');
    });
    it('should handle negative currency values', () => {
      expect(
        formatGraphValue(-1234.5, {
          displayType: 'currency',
          decimals: 2,
        }),
      ).toBe('$-1,234.50');
    });
    it('should handle currency with suffix', () => {
      expect(
        formatGraphValue(1000, {
          displayType: 'currency',
          prefix: '$',
          suffix: ' USD',
          decimals: 2,
        }),
      ).toBe('$1,000.00 USD');
    });
    it('should handle zero currency value', () => {
      expect(
        formatGraphValue(0, { displayType: 'currency', decimals: 2 }),
      ).toBe('$0.00');
    });
  });
  describe('shortNumber formatting', () => {
    it('should format short numbers', () => {
      expect(formatGraphValue(1000, { displayType: 'shortNumber' })).toBe('1k');
      expect(formatGraphValue(1000000, { displayType: 'shortNumber' })).toBe(
        '1m',
      );
      expect(formatGraphValue(1234567, { displayType: 'shortNumber' })).toBe(
        '1.2m',
      );
    });
    it('should handle short numbers with prefix and suffix', () => {
      expect(
        formatGraphValue(1000, {
          displayType: 'shortNumber',
          prefix: '$',
        }),
      ).toBe('$1k');
      expect(
        formatGraphValue(1000000, {
          displayType: 'shortNumber',
          suffix: ' revenue',
        }),
      ).toBe('1m revenue');
    });
  });
  describe('custom formatter', () => {
    it('should use custom formatter when provided', () => {
      const customFormatter = (value: number) => `Value: ${value}`;
      expect(
        formatGraphValue(123, {
          displayType: 'custom',
          customFormatter,
        }),
      ).toBe('Value: 123');
    });
    it('should ignore other options when using custom formatter', () => {
      const customFormatter = (value: number) => `Custom: ${value}`;
      expect(
        formatGraphValue(123, {
          displayType: 'custom',
          customFormatter,
          prefix: 'ignored',
          suffix: 'ignored',
          decimals: 2,
        }),
      ).toBe('Custom: 123');
    });
    it('should fallback to default when custom formatter is not provided', () => {
      expect(formatGraphValue(123, { displayType: 'custom' })).toBe('123');
    });
  });
  describe('edge cases', () => {
    it('should handle NaN', () => {
      expect(formatGraphValue(NaN)).toBe('NaN');
    });
    it('should handle Infinity', () => {
      expect(formatGraphValue(Infinity)).toBe('∞');
      expect(formatGraphValue(-Infinity)).toBe('-∞');
    });
    it('should handle undefined options', () => {
      expect(formatGraphValue(1234.5, undefined)).toBe('1,235');
    });
    it('should handle empty options object', () => {
      expect(formatGraphValue(1234.5, {})).toBe('1,235');
    });
  });
});
