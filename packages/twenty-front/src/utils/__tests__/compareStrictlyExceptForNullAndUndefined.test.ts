import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

describe('compareStrictlyExceptForNullAndUndefined', () => {
  it('should return true for undefined === null', () => {
    expect(compareStrictlyExceptForNullAndUndefined(undefined, null)).toBe(
      true,
    );
  });

  it('should return true for null === undefined', () => {
    expect(compareStrictlyExceptForNullAndUndefined(null, undefined)).toBe(
      true,
    );
  });

  it('should return true for undefined === undefined', () => {
    expect(compareStrictlyExceptForNullAndUndefined(undefined, undefined)).toBe(
      true,
    );
  });

  it('should return true for null === null', () => {
    expect(compareStrictlyExceptForNullAndUndefined(null, null)).toBe(true);
  });

  it('should return true for 2 === 2', () => {
    expect(compareStrictlyExceptForNullAndUndefined(2, 2)).toBe(true);
  });

  it('should return false for 2 === 3', () => {
    expect(compareStrictlyExceptForNullAndUndefined(2, 3)).toBe(false);
  });

  it('should return false for undefined === 2', () => {
    expect(compareStrictlyExceptForNullAndUndefined(undefined, 2)).toBe(false);
  });

  it('should return false for null === 2', () => {
    expect(compareStrictlyExceptForNullAndUndefined(null, 2)).toBe(false);
  });

  it('should return false for 2 === "2"', () => {
    expect(compareStrictlyExceptForNullAndUndefined(2, '2')).toBe(false);
  });

  it('should return true for "2" === "2"', () => {
    expect(compareStrictlyExceptForNullAndUndefined('2', '2')).toBe(true);
  });
});
