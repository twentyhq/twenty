import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

describe('isUndefinedOrNull', () => {
  it('should return true for null', () => {
    expect(isUndefinedOrNull(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isUndefinedOrNull(undefined)).toBe(true);
  });

  it('should return false for a number', () => {
    expect(isUndefinedOrNull(0)).toBe(false);
    expect(isUndefinedOrNull(42)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isUndefinedOrNull('')).toBe(false);
    expect(isUndefinedOrNull('hello')).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isUndefinedOrNull({})).toBe(false);
    expect(isUndefinedOrNull([])).toBe(false);
  });

  it('should return false for a boolean', () => {
    expect(isUndefinedOrNull(false)).toBe(false);
    expect(isUndefinedOrNull(true)).toBe(false);
  });
});
