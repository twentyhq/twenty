import { compareNonEmptyStrings } from '~/utils/compareNonEmptyStrings';

describe('compareNonEmptyStrings', () => {
  it('should return true when both values are empty or nullish', () => {
    expect(compareNonEmptyStrings(null, undefined)).toBe(true);
    expect(compareNonEmptyStrings('', null)).toBe(true);
    expect(compareNonEmptyStrings('', '')).toBe(true);
  });

  it('should return true when both values are equal non-empty strings', () => {
    expect(compareNonEmptyStrings('foo', 'foo')).toBe(true);
  });

  it('should return false when values differ', () => {
    expect(compareNonEmptyStrings('foo', 'bar')).toBe(false);
    expect(compareNonEmptyStrings('foo', '')).toBe(false);
    expect(compareNonEmptyStrings('foo', null)).toBe(false);
  });
});
