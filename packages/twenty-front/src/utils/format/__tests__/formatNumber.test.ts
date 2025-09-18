import { NumberFormat } from '@/localization/constants/NumberFormat';
import { formatNumber } from '../formatNumber';

describe('formatNumber', () => {
  describe('without format (backward compatibility)', () => {
    it('should format 123 correctly', () => {
      expect(formatNumber(123)).toEqual('123');
    });
    it('should format decimal numbers correctly', () => {
      expect(formatNumber(123.92, 2)).toEqual('123.92');
    });
    it('should format large numbers correctly', () => {
      expect(formatNumber(1234567)).toEqual('1,234,567');
    });
    it('should format large numbers with a decimal point correctly', () => {
      expect(formatNumber(7654321.89, 2)).toEqual('7,654,321.89');
    });
    it('should format apply decimals correctly', () => {
      expect(formatNumber(123.456, 2)).toEqual('123.46');
    });
  });

  describe('with localized formats', () => {
    it('should format with COMMAS_AND_DOT', () => {
      expect(formatNumber(1234.56, NumberFormat.COMMAS_AND_DOT, 2)).toEqual(
        '1,234.56',
      );
    });
    it('should format with SPACES_AND_COMMA', () => {
      expect(formatNumber(1234.56, NumberFormat.SPACES_AND_COMMA, 2)).toEqual(
        '1\u202F234,56', // Uses narrow no-break space (U+202F)
      );
    });
    it('should format with DOTS_AND_COMMA', () => {
      expect(formatNumber(1234.56, NumberFormat.DOTS_AND_COMMA, 2)).toEqual(
        '1.234,56',
      );
    });
    it('should format with APOSTROPHE_AND_DOT', () => {
      expect(formatNumber(1234.56, NumberFormat.APOSTROPHE_AND_DOT, 2)).toEqual(
        '1\u2019234.56', // Uses right single quotation mark (U+2019)
      );
    });
  });
});
