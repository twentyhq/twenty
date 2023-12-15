import { isDefined } from '~/utils/isDefined';

describe('isDefined', () => {
  it('should return true for a NonNullable value', () => {
    expect(isDefined(1)).toBe(true);
  });

  it('should return true for a NonNullable value', () => {
    expect(isDefined('')).toBe(true);
  });

  it('should return false for a null value', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('should return false for an undefined value', () => {
    expect(isDefined(undefined)).toBe(false);
  });
});
