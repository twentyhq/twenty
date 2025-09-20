import { formatNumber } from '~/utils/format/formatNumber';
import { NumberFormat } from '@/localization/constants/NumberFormat';

describe('formatNumber', () => {
  describe('with Infinity', () => {
    it('should return Infinity for Infinity', () => {
      expect(formatNumber(Infinity)).toEqual('Infinity');
    });
  });
  describe('without format', () => {
    it('should format 123 correctly', () => {
      expect(formatNumber(123)).toEqual('123');
    });
    it('should format decimal numbers correctly', () => {
      expect(formatNumber(123.92, { decimals: 2 })).toEqual('123.92');
    });
    it('should format large numbers correctly', () => {
      expect(formatNumber(1234567)).toEqual('1,234,567');
    });
    it('should format large numbers with a decimal point correctly', () => {
      expect(formatNumber(7654321.89, { decimals: 2 })).toEqual('7,654,321.89');
    });
    it('should format apply decimals correctly', () => {
      expect(formatNumber(123.456, { decimals: 2 })).toEqual('123.46');
    });
  });
  describe('with localized formats', () => {
    it('should format with COMMAS_AND_DOT', () => {
      expect(
        formatNumber(1234.56, {
          format: NumberFormat.COMMAS_AND_DOT,
          decimals: 2,
        }),
      ).toEqual('1,234.56');
    });
    it('should format with SPACES_AND_COMMA', () => {
      expect(
        formatNumber(1234.56, {
          format: NumberFormat.SPACES_AND_COMMA,
          decimals: 2,
        }),
      ).toEqual(
        '1\u202F234,56', // Uses narrow no-break space (U+202F)
      );
    });
    it('should format with DOTS_AND_COMMA', () => {
      expect(
        formatNumber(1234.56, {
          format: NumberFormat.DOTS_AND_COMMA,
          decimals: 2,
        }),
      ).toEqual('1.234,56');
    });
    it('should format with APOSTROPHE_AND_DOT', () => {
      expect(
        formatNumber(1234.56, {
          format: NumberFormat.APOSTROPHE_AND_DOT,
          decimals: 2,
        }),
      ).toEqual(
        '1\u2019234.56', // Uses right single quotation mark (U+2019)
      );
    });
  });
  describe('with abbreviate', () => {
    it('should leave numbers under 1000 unchanged when abbreviate is true', () => {
      expect(formatNumber(999, { abbreviate: true })).toEqual('999');
    });

    it('should abbreviate thousands with default decimals (0)', () => {
      expect(formatNumber(1234, { abbreviate: true })).toEqual('1k');
    });

    it('should abbreviate thousands with provided decimals', () => {
      expect(formatNumber(1234, { abbreviate: true, decimals: 2 })).toEqual(
        '1.23k',
      );
      expect(formatNumber(1234, { abbreviate: true, decimals: 1 })).toEqual(
        '1.2k',
      );
    });

    it('should abbreviate millions', () => {
      expect(formatNumber(1234567, { abbreviate: true, decimals: 2 })).toEqual(
        '1.23M',
      );
    });

    it('should abbreviate billions', () => {
      expect(
        formatNumber(1500000000, { abbreviate: true, decimals: 1 }),
      ).toEqual('1.5B');
    });

    it('should use locale/format for decimal separator when abbreviating', () => {
      expect(
        formatNumber(1234567, {
          abbreviate: true,
          decimals: 2,
          format: NumberFormat.SPACES_AND_COMMA,
        }),
      ).toEqual('1,23M');

      expect(
        formatNumber(1234567, {
          abbreviate: true,
          decimals: 2,
          format: NumberFormat.DOTS_AND_COMMA,
        }),
      ).toEqual('1,23M');

      expect(
        formatNumber(1234567, {
          abbreviate: true,
          decimals: 2,
          format: NumberFormat.COMMAS_AND_DOT,
        }),
      ).toEqual('1.23M');
    });

    it('should preserve sign for negative values', () => {
      expect(formatNumber(-1500, { abbreviate: true, decimals: 1 })).toEqual(
        '-1.5k',
      );
    });
  });
});
