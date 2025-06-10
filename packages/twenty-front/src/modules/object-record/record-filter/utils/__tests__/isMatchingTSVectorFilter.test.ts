import { isMatchingTSVectorFilter } from '@/object-record/record-filter/utils/isMatchingTSVectorFilter';

describe('isMatchingTSVectorFilter', () => {
  describe('search', () => {
    it('value matches search filter', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'test' },
          value: 'test document',
        }),
      ).toBe(true);
    });

    it('value does not match search filter', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'missing' },
          value: 'test document',
        }),
      ).toBe(false);
    });

    it('search is case insensitive', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'TEST' },
          value: 'test document',
        }),
      ).toBe(true);
    });

    it('search matches partial words', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'doc' },
          value: 'test document',
        }),
      ).toBe(true);
    });

    it('search matches multiple words', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'test doc' },
          value: 'test document',
        }),
      ).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown filter type', () => {
      expect(() =>
        isMatchingTSVectorFilter({
          tsVectorFilter: { unknownFilter: 'test' } as any,
          value: 'test document',
        }),
      ).toThrow('Unexpected value for ts_vector filter');
    });
  });
});
