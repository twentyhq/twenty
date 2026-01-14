import { sortOptionsForManualOrder } from '@/page-layout/widgets/graph/utils/sortOptionsForManualOrder';

describe('sortOptionsForManualOrder', () => {
  describe('without manual sort order', () => {
    it('should sort by position when no manual order provided', () => {
      const options = [
        { value: 'c', position: 2 },
        { value: 'a', position: 0 },
        { value: 'b', position: 1 },
      ];

      const result = sortOptionsForManualOrder(options, undefined);

      expect(result.map((option) => option.value)).toEqual(['a', 'b', 'c']);
    });

    it('should sort by position when manual order is null', () => {
      const options = [
        { value: 'c', position: 2 },
        { value: 'a', position: 0 },
        { value: 'b', position: 1 },
      ];

      const result = sortOptionsForManualOrder(options, null);

      expect(result.map((option) => option.value)).toEqual(['a', 'b', 'c']);
    });

    it('should sort by position when manual order is empty', () => {
      const options = [
        { value: 'c', position: 2 },
        { value: 'a', position: 0 },
        { value: 'b', position: 1 },
      ];

      const result = sortOptionsForManualOrder(options, []);

      expect(result.map((option) => option.value)).toEqual(['a', 'b', 'c']);
    });

    it('should handle null positions as 0', () => {
      const options = [
        { value: 'b', position: 1 },
        { value: 'a', position: null },
      ];

      const result = sortOptionsForManualOrder(options, undefined);

      expect(result.map((option) => option.value)).toEqual(['a', 'b']);
    });
  });

  describe('with manual sort order', () => {
    it('should sort according to manual order', () => {
      const options = [
        { value: 'a', position: 0 },
        { value: 'b', position: 1 },
        { value: 'c', position: 2 },
      ];
      const manualSortOrder = ['c', 'a', 'b'];

      const result = sortOptionsForManualOrder(options, manualSortOrder);

      expect(result.map((option) => option.value)).toEqual(['c', 'a', 'b']);
    });

    it('should place options not in manual order at the end', () => {
      const options = [
        { value: 'a', position: 0 },
        { value: 'b', position: 1 },
        { value: 'c', position: 2 },
      ];
      const manualSortOrder = ['b'];

      const result = sortOptionsForManualOrder(options, manualSortOrder);

      expect(result.map((option) => option.value)).toEqual(['b', 'a', 'c']);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original array', () => {
      const options = [
        { value: 'c', position: 2 },
        { value: 'a', position: 0 },
      ];
      const originalOptions = [...options];

      sortOptionsForManualOrder(options, ['a', 'c']);

      expect(options).toEqual(originalOptions);
    });
  });
});
