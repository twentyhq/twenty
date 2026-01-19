import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

import { sortOptionsForManualOrder } from '@/page-layout/widgets/graph/utils/sortOptionsForManualOrder';

const createOption = (
  value: string,
  label?: string,
): FieldMetadataItemOption => ({
  id: `id-${value}`,
  value,
  label: label ?? value.toUpperCase(),
  color: 'green',
  position: 0,
});

describe('sortOptionsForManualOrder', () => {
  describe('when manualSortOrder is not provided', () => {
    it('should return options unchanged for undefined order', () => {
      const options = [createOption('a'), createOption('b'), createOption('c')];

      const result = sortOptionsForManualOrder(options, undefined);

      expect(result).toEqual(options);
    });

    it('should return options unchanged for null order', () => {
      const options = [createOption('a'), createOption('b'), createOption('c')];

      const result = sortOptionsForManualOrder(options, null);

      expect(result).toEqual(options);
    });

    it('should return options unchanged for empty order array', () => {
      const options = [createOption('a'), createOption('b'), createOption('c')];

      const result = sortOptionsForManualOrder(options, []);

      expect(result).toEqual(options);
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
