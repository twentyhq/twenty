import { formatToShortNumber } from '~/utils/format/formatToShortNumber';

describe('formatToShortNumber', () => {
  it('formats numbers less than 1000 correctly', () => {
    expect(formatToShortNumber(500)).toBe('500');
    expect(formatToShortNumber(123.456)).toBe('123.5');
  });

  it('formats numbers between 1000 and 999999 correctly', () => {
    expect(formatToShortNumber(1500)).toBe('1.5k');
    expect(formatToShortNumber(789456)).toBe('789.5k');
  });

  it('formats numbers between 1000000 and 999999999 correctly', () => {
    expect(formatToShortNumber(2000000)).toBe('2m');
    expect(formatToShortNumber(654987654)).toBe('655m');
  });

  it('formats numbers greater than or equal to 1000000000 correctly', () => {
    expect(formatToShortNumber(1200000000)).toBe('1.2b');
    expect(formatToShortNumber(987654321987)).toBe('987.7b');
  });

  it('handles numbers with decimal places correctly', () => {
    expect(formatToShortNumber(123.456)).toBe('123.5');
    expect(formatToShortNumber(789.0123)).toBe('789');
  });

  it('handles zero correctly', () => {
    expect(formatToShortNumber(0)).toBe('0');
  });

  describe('negative numbers', () => {
    it('formats negative numbers less than 1000 correctly', () => {
      expect(formatToShortNumber(-500)).toBe('-500');
      expect(formatToShortNumber(-123.456)).toBe('-123.5');
    });

    it('formats negative thousands correctly', () => {
      expect(formatToShortNumber(-1500)).toBe('-1.5k');
      expect(formatToShortNumber(-789456)).toBe('-789.5k');
    });

    it('formats negative millions correctly', () => {
      expect(formatToShortNumber(-2000000)).toBe('-2m');
      expect(formatToShortNumber(-654987654)).toBe('-655m');
    });

    it('formats negative billions correctly', () => {
      expect(formatToShortNumber(-1200000000)).toBe('-1.2b');
      expect(formatToShortNumber(-987654321987)).toBe('-987.7b');
    });
  });
});
