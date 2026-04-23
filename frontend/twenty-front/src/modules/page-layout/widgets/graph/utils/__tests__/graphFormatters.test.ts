import { formatGraphValue } from '@/page-layout/widgets/graph/utils/graphFormatters';

describe('formatGraphValue', () => {
  describe('number display type (default)', () => {
    it('should format number without options', () => {
      const result = formatGraphValue(1234.56);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format positive numbers', () => {
      const result = formatGraphValue(100, { displayType: 'number' });

      expect(result).toContain('100');
    });

    it('should format negative numbers with sign', () => {
      const result = formatGraphValue(-100, { displayType: 'number' });

      expect(result).toContain('-');
      expect(result).toContain('100');
    });

    it('should apply prefix and suffix', () => {
      const result = formatGraphValue(100, {
        displayType: 'number',
        prefix: 'Value: ',
        suffix: ' units',
      });

      expect(result).toContain('Value: ');
      expect(result).toContain(' units');
    });
  });

  describe('percentage display type', () => {
    it('should convert decimal to percentage', () => {
      const result = formatGraphValue(0.5, { displayType: 'percentage' });

      expect(result).toContain('50');
      expect(result).toContain('%');
    });

    it('should handle 100% correctly', () => {
      const result = formatGraphValue(1, { displayType: 'percentage' });

      expect(result).toContain('100');
      expect(result).toContain('%');
    });

    it('should handle small percentages', () => {
      const result = formatGraphValue(0.01, { displayType: 'percentage' });

      expect(result).toContain('1');
      expect(result).toContain('%');
    });

    it('should handle negative percentages', () => {
      const result = formatGraphValue(-0.25, { displayType: 'percentage' });

      expect(result).toContain('%');
    });
  });

  describe('shortNumber display type', () => {
    it('should format large numbers with K suffix', () => {
      const result = formatGraphValue(1500, { displayType: 'shortNumber' });

      expect(result).toBeDefined();
    });

    it('should format very large numbers with M suffix', () => {
      const result = formatGraphValue(1500000, { displayType: 'shortNumber' });

      expect(result).toBeDefined();
    });

    it('should apply prefix to short numbers', () => {
      const result = formatGraphValue(1000, {
        displayType: 'shortNumber',
        prefix: '$',
      });

      expect(result).toContain('$');
    });

    it('should handle negative short numbers', () => {
      const result = formatGraphValue(-2500, { displayType: 'shortNumber' });

      expect(result).toContain('-');
    });
  });

  describe('currency display type', () => {
    it('should use default $ prefix for currency', () => {
      const result = formatGraphValue(100, { displayType: 'currency' });

      expect(result).toContain('$');
      expect(result).toContain('100');
    });

    it('should use custom prefix for currency', () => {
      const result = formatGraphValue(100, {
        displayType: 'currency',
        prefix: '€',
      });

      expect(result).toContain('€');
      expect(result).toContain('100');
    });

    it('should handle negative currency values', () => {
      const result = formatGraphValue(-500, { displayType: 'currency' });

      expect(result).toContain('-');
      expect(result).toContain('$');
      expect(result).toContain('500');
    });

    it('should apply suffix to currency', () => {
      const result = formatGraphValue(100, {
        displayType: 'currency',
        suffix: ' USD',
      });

      expect(result).toContain(' USD');
    });
  });

  describe('custom display type', () => {
    it('should use custom formatter when provided', () => {
      const customFormatter = (value: number) => `Custom: ${value * 2}`;
      const result = formatGraphValue(50, {
        displayType: 'custom',
        customFormatter,
      });

      expect(result).toBe('Custom: 100');
    });

    it('should ignore other options when using custom formatter', () => {
      const customFormatter = (value: number) => `${value}!`;
      const result = formatGraphValue(42, {
        displayType: 'custom',
        customFormatter,
        prefix: 'ignored',
        suffix: 'ignored',
      });

      expect(result).toBe('42!');
    });
  });

  describe('decimals option', () => {
    it('should respect decimals in percentage format', () => {
      const result = formatGraphValue(0.333, {
        displayType: 'percentage',
        decimals: 2,
      });

      expect(result).toContain('%');
    });

    it('should respect decimals in currency format', () => {
      const result = formatGraphValue(99.999, {
        displayType: 'currency',
        decimals: 2,
      });

      expect(result).toContain('$');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      const result = formatGraphValue(0, { displayType: 'number' });

      expect(result).toBeDefined();
    });

    it('should handle very small numbers', () => {
      const result = formatGraphValue(0.001, { displayType: 'number' });

      expect(result).toBeDefined();
    });

    it('should handle very large numbers', () => {
      const result = formatGraphValue(999999999999, { displayType: 'number' });

      expect(result).toBeDefined();
    });
  });
});
