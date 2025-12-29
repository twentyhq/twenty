import { turnOrderByIntoSort } from '~/utils/turnOrderByIntoSort';

describe('turnOrderByIntoSort', () => {
  it('should be ok for "AscNullsFirst"', () => {
    expect(turnOrderByIntoSort('AscNullsFirst')).toBe('asc');
  });

  it('should be ok for "AscNullsLast"', () => {
    expect(turnOrderByIntoSort('AscNullsLast')).toBe('asc');
  });

  it('should be ok for "DescNullsFirst"', () => {
    expect(turnOrderByIntoSort('DescNullsFirst')).toBe('desc');
  });

  it('should be ok for "DescNullsLast"', () => {
    expect(turnOrderByIntoSort('DescNullsLast')).toBe('desc');
  });
});
