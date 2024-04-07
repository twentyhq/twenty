import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats numbers less than 1000 correctly', () => {
    expect(formatCurrency(500)).toBe('500');
    expect(formatCurrency(123.456)).toBe('123.5');
  });

  it('formats numbers between 1000 and 999999 correctly', () => {
    expect(formatCurrency(1500)).toBe('1.5k');
    expect(formatCurrency(789456)).toBe('789.5k');
  });

  it('formats numbers between 1000000 and 999999999 correctly', () => {
    expect(formatCurrency(2000000)).toBe('2m');
    expect(formatCurrency(654987654)).toBe('655m');
  });

  it('formats numbers greater than or equal to 1000000000 correctly', () => {
    expect(formatCurrency(1200000000)).toBe('1.2b');
    expect(formatCurrency(987654321987)).toBe('987.7b');
  });

  it('handles numbers with decimal places correctly', () => {
    expect(formatCurrency(123.456)).toBe('123.5');
    expect(formatCurrency(789.0123)).toBe('789');
  });
});
