import { normalizeScrollOffset } from '@/polyfills/scroll/utils/normalizeScrollOffset';

describe('normalizeScrollOffset', () => {
  it('should keep finite numbers including negative and fractional offsets', () => {
    expect(normalizeScrollOffset(120)).toBe(120);
    expect(normalizeScrollOffset(-48)).toBe(-48);
    expect(normalizeScrollOffset(12.5)).toBe(12.5);
  });

  it('should convert numeric strings to numbers', () => {
    expect(normalizeScrollOffset('42')).toBe(42);
    expect(normalizeScrollOffset('-7.5')).toBe(-7.5);
    expect(normalizeScrollOffset(' 16 ')).toBe(16);
  });

  it('should return zero for non-finite numbers', () => {
    expect(normalizeScrollOffset(Number.NaN)).toBe(0);
    expect(normalizeScrollOffset(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeScrollOffset(Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it('should return zero for undefined and non-numeric strings', () => {
    expect(normalizeScrollOffset(undefined)).toBe(0);
    expect(normalizeScrollOffset('auto')).toBe(0);
    expect(normalizeScrollOffset('12px')).toBe(0);
  });
});
