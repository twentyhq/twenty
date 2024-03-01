import { isNonNullable } from '~/utils/isNonNullable';

describe('isNonNullable', () => {
  it('returns true if value is not undefined nor null', () => {
    expect(isNonNullable('')).toBe(true);
  });

  it('returns false if value is null', () => {
    expect(isNonNullable(null)).toBe(false);
  });

  it('returns false if value is undefined', () => {
    expect(isNonNullable(undefined)).toBe(false);
  });
});
