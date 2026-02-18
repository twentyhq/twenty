import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

import { sortOptionsForManualOrder } from '@/page-layout/widgets/graph/utils/sortOptionsForManualOrder';

const createOption = (
  value: string,
  label?: string,
  position?: number,
): FieldMetadataItemOption => ({
  id: `id-${value}`,
  value,
  label: label ?? value.toUpperCase(),
  color: 'green',
  position: position ?? 0,
});

describe('sortOptionsForManualOrder', () => {
  describe('when manualSortOrder is not provided', () => {
    it('should sort options by position for undefined order', () => {
      const options = [
        createOption('c', undefined, 3),
        createOption('a', undefined, 1),
        createOption('b', undefined, 2),
      ];

      const result = sortOptionsForManualOrder(options, undefined);

      expect(result.map((option) => option.value)).toEqual(['a', 'b', 'c']);
    });

    it('should sort options by position for null order', () => {
      const options = [
        createOption('z', undefined, 3),
        createOption('x', undefined, 1),
        createOption('y', undefined, 2),
      ];

      const result = sortOptionsForManualOrder(options, null);

      expect(result.map((option) => option.value)).toEqual(['x', 'y', 'z']);
    });

    it('should sort options by position for empty order array', () => {
      const options = [
        createOption('m', undefined, 3),
        createOption('k', undefined, 1),
        createOption('l', undefined, 2),
      ];

      const result = sortOptionsForManualOrder(options, []);

      expect(result.map((option) => option.value)).toEqual(['k', 'l', 'm']);
    });

    it('should handle options with same position', () => {
      const options = [
        createOption('b', undefined, 1),
        createOption('a', undefined, 1),
        createOption('c', undefined, 2),
      ];

      const result = sortOptionsForManualOrder(options, undefined);

      expect(result.map((option) => option.value)).toEqual(['b', 'a', 'c']);
    });

    it('should handle options with undefined position', () => {
      const options = [
        createOption('b', undefined, 2),
        createOption('a', undefined, undefined),
        createOption('c', undefined, 3),
      ];

      const result = sortOptionsForManualOrder(options, undefined);

      expect(result.map((option) => option.value)).toEqual(['a', 'b', 'c']);
    });

    it('should not mutate the original options array', () => {
      const options = [
        createOption('c', undefined, 3),
        createOption('a', undefined, 1),
        createOption('b', undefined, 2),
      ];
      const originalOrder = options.map((option) => option.value);

      sortOptionsForManualOrder(options, undefined);

      expect(options.map((option) => option.value)).toEqual(originalOrder);
    });
  });

  describe('when manualSortOrder is provided', () => {
    it('should sort options according to manual order', () => {
      const options = [createOption('a'), createOption('b'), createOption('c')];
      const manualOrder = ['c', 'a', 'b'];

      const result = sortOptionsForManualOrder(options, manualOrder);

      expect(result.map((option) => option.value)).toEqual(['c', 'a', 'b']);
    });

    it('should handle reverse order', () => {
      const options = [createOption('a'), createOption('b'), createOption('c')];
      const manualOrder = ['c', 'b', 'a'];

      const result = sortOptionsForManualOrder(options, manualOrder);

      expect(result.map((option) => option.value)).toEqual(['c', 'b', 'a']);
    });

    it('should place items not in manual order at the end', () => {
      const options = [
        createOption('a'),
        createOption('b'),
        createOption('c'),
        createOption('d'),
      ];
      const manualOrder = ['c', 'a'];

      const result = sortOptionsForManualOrder(options, manualOrder);

      expect(result.map((option) => option.value)).toEqual([
        'c',
        'a',
        'b',
        'd',
      ]);
    });

    it('should handle partial manual order correctly', () => {
      const options = [createOption('x'), createOption('y'), createOption('z')];
      const manualOrder = ['z'];

      const result = sortOptionsForManualOrder(options, manualOrder);

      expect(result[0].value).toBe('z');
    });

    it('should not mutate the original options array', () => {
      const options = [createOption('a'), createOption('b'), createOption('c')];
      const originalOrder = options.map((option) => option.value);
      const manualOrder = ['c', 'b', 'a'];

      sortOptionsForManualOrder(options, manualOrder);

      expect(options.map((option) => option.value)).toEqual(originalOrder);
    });
  });

  describe('edge cases', () => {
    it('should handle empty options array', () => {
      const options: FieldMetadataItemOption[] = [];
      const manualOrder = ['a', 'b'];

      const result = sortOptionsForManualOrder(options, manualOrder);

      expect(result).toEqual([]);
    });

    it('should handle single option', () => {
      const options = [createOption('a')];
      const manualOrder = ['a'];

      const result = sortOptionsForManualOrder(options, manualOrder);

      expect(result.map((option) => option.value)).toEqual(['a']);
    });

    it('should handle manual order with values not in options', () => {
      const options = [createOption('a'), createOption('b')];
      const manualOrder = ['x', 'a', 'y', 'b', 'z'];

      const result = sortOptionsForManualOrder(options, manualOrder);

      expect(result.map((option) => option.value)).toEqual(['a', 'b']);
    });
  });
});
