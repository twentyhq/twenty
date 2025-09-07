import { sortByAscString } from '~/utils/array/sortByAscString';

  describe('sortByAscString', () => {
    test('should sort properly', () => {
      expect(sortByAscString('a', 'b')).toEqual(-1);
      expect(sortByAscString('b', 'a')).toEqual(1);
      expect(sortByAscString('a', 'a')).toEqual(0);
    });

    test('supports locale-aware sorting', () => {
      expect(sortByAscString('ب', 'پ', 'fa')).toEqual(-1);
    });
  });
