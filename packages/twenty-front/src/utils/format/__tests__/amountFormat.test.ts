import { amountFormat } from '../amountFormat';

describe('amountFormat', () => {
  it('formats numbers less than 1000 correctly', () => {
    expect(amountFormat(500)).toBe('500');
    expect(amountFormat(123.456)).toBe('123.5');
  });

  it('formats numbers between 1000 and 999999 correctly', () => {
    expect(amountFormat(1500)).toBe('1.5k');
    expect(amountFormat(789456)).toBe('789.5k');
  });

  it('formats numbers between 1000000 and 999999999 correctly', () => {
    expect(amountFormat(2000000)).toBe('2m');
    expect(amountFormat(654987654)).toBe('655m');
  });

  it('formats numbers greater than or equal to 1000000000 correctly', () => {
    expect(amountFormat(1200000000)).toBe('1.2b');
    expect(amountFormat(987654321987)).toBe('987.7b');
  });

  it('handles numbers with decimal places correctly', () => {
    expect(amountFormat(123.456)).toBe('123.5');
    expect(amountFormat(789.0123)).toBe('789');
  });
});
