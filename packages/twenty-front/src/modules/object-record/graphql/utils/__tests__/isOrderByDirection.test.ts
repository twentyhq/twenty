import { isOrderByDirection } from '@/object-record/graphql/utils/isOrderByDirection';

describe('isOrderByDirection', () => {
  it('should return true for valid order by directions', () => {
    expect(isOrderByDirection('AscNullsFirst')).toBe(true);
    expect(isOrderByDirection('AscNullsLast')).toBe(true);
    expect(isOrderByDirection('DescNullsFirst')).toBe(true);
    expect(isOrderByDirection('DescNullsLast')).toBe(true);
  });

  it('should return false for unknown strings', () => {
    expect(isOrderByDirection('Asc')).toBe(false);
    expect(isOrderByDirection('random')).toBe(false);
    expect(isOrderByDirection('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isOrderByDirection(undefined)).toBe(false);
    expect(isOrderByDirection(null)).toBe(false);
    expect(isOrderByDirection(42)).toBe(false);
    expect(isOrderByDirection({ foo: 'AscNullsFirst' })).toBe(false);
  });
});
