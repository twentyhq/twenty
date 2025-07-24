import { compareNonEmptyStrings } from '~/utils/compareNonEmptyStrings';

describe('compareNonEmptyStrings', () => {
  it('should return true for undefined === null', () => {
    expect(compareNonEmptyStrings(undefined, null)).toBe(true);
  });

  it('should return true for null === undefined', () => {
    expect(compareNonEmptyStrings(null, undefined)).toBe(true);
  });

  it('should return true for undefined === undefined', () => {
    expect(compareNonEmptyStrings(undefined, undefined)).toBe(true);
  });

  it('should return true for null === null', () => {
    expect(compareNonEmptyStrings(null, null)).toBe(true);
  });

  it('should return true for "" === null', () => {
    expect(compareNonEmptyStrings('', null)).toBe(true);
  });

  it('should return true for "" === undefined', () => {
    expect(compareNonEmptyStrings('', undefined)).toBe(true);
  });

  it('should return true for "" === ""', () => {
    expect(compareNonEmptyStrings('', '')).toBe(true);
  });

  it('should return true for "a" === "a"', () => {
    expect(compareNonEmptyStrings('a', 'a')).toBe(true);
  });

  it('should return false for "a" === "b"', () => {
    expect(compareNonEmptyStrings('a', 'b')).toBe(false);
  });

  it('should return false for undefined === "a"', () => {
    expect(compareNonEmptyStrings(undefined, 'a')).toBe(false);
  });

  it('should return false for null === "a"', () => {
    expect(compareNonEmptyStrings(null, 'a')).toBe(false);
  });

  it('should return false for "" === "a"', () => {
    expect(compareNonEmptyStrings('', 'a')).toBe(false);
  });
});
