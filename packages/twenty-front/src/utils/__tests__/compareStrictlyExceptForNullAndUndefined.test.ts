import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

describe('compareStrictlyExceptForNullAndUndefined', () => {
  it('should return true when both values are nullish', () => {
    expect(compareStrictlyExceptForNullAndUndefined(null, undefined)).toBe(
      true,
    );
    expect(compareStrictlyExceptForNullAndUndefined(undefined, null)).toBe(
      true,
    );
  });

  it('should compare strictly when at least one value is defined', () => {
    expect(compareStrictlyExceptForNullAndUndefined(1, 1)).toBe(true);
    expect(compareStrictlyExceptForNullAndUndefined('a', 'a')).toBe(true);
    expect(compareStrictlyExceptForNullAndUndefined(1, 2)).toBe(false);
    expect(compareStrictlyExceptForNullAndUndefined(1, null)).toBe(false);
  });

  it('should not treat zero or empty string as nullish', () => {
    expect(compareStrictlyExceptForNullAndUndefined(0, null)).toBe(false);
    expect(compareStrictlyExceptForNullAndUndefined('', undefined)).toBe(false);
  });
});
