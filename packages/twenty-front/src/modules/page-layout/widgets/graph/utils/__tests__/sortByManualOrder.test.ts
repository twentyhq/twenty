import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';

describe('sortByManualOrder', () => {
  describe('basic sorting', () => {
    it('should sort items according to manual order', () => {
      const items = [
        { id: 'c', value: 3 },
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];
      const manualSortOrder = ['a', 'b', 'c'];

      const result = sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => item.id,
      });

      expect(result.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    });

    it('should handle reverse order', () => {
      const items = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ];
      const manualSortOrder = ['c', 'b', 'a'];

      const result = sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => item.id,
      });

      expect(result.map((item) => item.id)).toEqual(['c', 'b', 'a']);
    });
  });

  describe('empty manual sort order', () => {
    it('should return items unchanged when manual order is empty', () => {
      const items = [
        { id: 'c', value: 3 },
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];

      const result = sortByManualOrder({
        items,
        manualSortOrder: [],
        getRawValue: (item) => item.id,
      });

      expect(result).toEqual(items);
    });
  });

  describe('items not in manual order', () => {
    it('should place items not in manual order at the end', () => {
      const items = [
        { id: 'unknown', value: 0 },
        { id: 'b', value: 2 },
        { id: 'a', value: 1 },
      ];
      const manualSortOrder = ['a', 'b'];

      const result = sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => item.id,
      });

      expect(result.map((item) => item.id)).toEqual(['a', 'b', 'unknown']);
    });

    it('should maintain relative order of items not in manual order', () => {
      const items = [
        { id: 'unknown1', value: 0 },
        { id: 'a', value: 1 },
        { id: 'unknown2', value: 0 },
      ];
      const manualSortOrder = ['a'];

      const result = sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => item.id,
      });

      expect(result[0].id).toBe('a');
      expect(result[1].id).toBe('unknown1');
      expect(result[2].id).toBe('unknown2');
    });
  });

  describe('null and undefined values', () => {
    it('should handle null raw values', () => {
      const items = [
        { id: null as string | null, value: 0 },
        { id: 'a', value: 1 },
      ];

      const result = sortByManualOrder({
        items,
        manualSortOrder: ['a'],
        getRawValue: (item) => item.id,
      });

      expect(result[0].id).toBe('a');
    });

    it('should handle undefined raw values', () => {
      const items = [
        { id: undefined as string | undefined, value: 0 },
        { id: 'a', value: 1 },
      ];

      const result = sortByManualOrder({
        items,
        manualSortOrder: ['a'],
        getRawValue: (item) => item.id,
      });

      expect(result[0].id).toBe('a');
    });
  });

  describe('immutability', () => {
    it('should not mutate the original array', () => {
      const items = [
        { id: 'c', value: 3 },
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];
      const originalItems = [...items];

      sortByManualOrder({
        items,
        manualSortOrder: ['a', 'b', 'c'],
        getRawValue: (item) => item.id,
      });

      expect(items).toEqual(originalItems);
    });
  });
});
