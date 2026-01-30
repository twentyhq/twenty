import { sortAsc, sortDesc, sortNullsFirst, sortNullsLast } from '~/utils/sort';

describe('sort', () => {
  describe('sortNullsFirst', () => {
    it('should sort nulls first', () => {
      expect(sortNullsFirst(null, null)).toBe(0);
      expect(sortNullsFirst(null, 'a')).toBe(-1);
      expect(sortNullsFirst('a', null)).toBe(1);
      expect(sortNullsFirst('a', 'a')).toBe(0);
    });
  });

  describe('sortNullsLast', () => {
    it('should sort nulls last', () => {
      expect(sortNullsFirst(null, null)).toBe(0);
      expect(sortNullsLast(null, 'a')).toBe(1);
      expect(sortNullsLast('a', null)).toBe(-1);
      expect(sortNullsLast('a', 'a')).toBe(0);
    });
  });

  describe('sortAsc', () => {
    it('should sort in ascending order', () => {
      expect(sortAsc('a', 'b')).toBe(-1);
      expect(sortAsc('b', 'a')).toBe(1);
      expect(sortAsc('a', 'a')).toBe(0);
    });
  });

  describe('sortDesc', () => {
    it('should sort in descending order', () => {
      expect(sortDesc('a', 'b')).toBe(1);
      expect(sortDesc('b', 'a')).toBe(-1);
      expect(sortDesc('a', 'a')).toBe(0);
    });
  });
});
