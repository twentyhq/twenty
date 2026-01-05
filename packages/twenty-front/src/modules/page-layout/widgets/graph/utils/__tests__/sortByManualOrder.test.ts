import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';

describe('sortByManualOrder', () => {
  describe('basic sorting', () => {
    it('should sort items according to manual order', () => {
      const items = [
        { id: 'c', position: 2 },
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
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
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
        { id: 'c', position: 2 },
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
    it('should sort by position when manual order is empty', () => {
      const items = [
        { id: 'c', position: 2 },
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
      ];

      const result = sortByManualOrder({
        items,
        manualSortOrder: [],
        getRawValue: (item) => item.id,
      });

      expect(result.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('items not in manual order', () => {
    it('should place items not in manual order at the end', () => {
      const items = [
        { id: 'unknown', position: 0 },
        { id: 'b', position: 2 },
        { id: 'a', position: 1 },
      ];
      const manualSortOrder = ['a', 'b'];

      const result = sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => item.id,
      });

      expect(result.map((item) => item.id)).toEqual(['a', 'b', 'unknown']);
    });

    it('should sort items not in manual order by position', () => {
      const items = [
        { id: 'unknown1', position: 2 },
        { id: 'a', position: 0 },
        { id: 'unknown2', position: 1 },
      ];
      const manualSortOrder = ['a'];

      const result = sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => item.id,
      });

      expect(result.map((item) => item.id)).toEqual([
        'a',
        'unknown2',
        'unknown1',
      ]);
    });
  });

  describe('null and undefined values', () => {
    it('should handle null raw values', () => {
      const items = [
        { id: null as string | null, position: 0 },
        { id: 'a', position: 1 },
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
        { id: undefined as string | undefined, position: 0 },
        { id: 'a', position: 1 },
      ];

      const result = sortByManualOrder({
        items,
        manualSortOrder: ['a'],
        getRawValue: (item) => item.id,
      });

      expect(result[0].id).toBe('a');
    });

    it('should handle null positions as 0', () => {
      const items = [
        { id: 'b', position: 1 },
        { id: 'a', position: null },
      ];

      const result = sortByManualOrder({
        items,
        manualSortOrder: [],
        getRawValue: (item) => item.id,
      });

      expect(result.map((item) => item.id)).toEqual(['a', 'b']);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original array', () => {
      const items = [
        { id: 'c', position: 2 },
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
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
