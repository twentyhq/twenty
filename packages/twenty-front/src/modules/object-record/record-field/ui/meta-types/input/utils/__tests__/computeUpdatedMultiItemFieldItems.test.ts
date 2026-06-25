import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';

const items = ['a', 'b', 'c'];

describe('computeUpdatedMultiItemFieldItems', () => {
  describe('empty input', () => {
    it('should return items unchanged when adding', () => {
      const result = computeUpdatedMultiItemFieldItems({
        sanitizedInput: '',
        items,
        editingIndex: null,
        singleItemMode: false,
      });

      expect(result).toBe(items);
    });

    it('should clear all items in single-item mode', () => {
      const result = computeUpdatedMultiItemFieldItems({
        sanitizedInput: '',
        items,
        editingIndex: 0,
        singleItemMode: true,
      });

      expect(result).toEqual([]);
    });

    it('should remove the edited item', () => {
      const result = computeUpdatedMultiItemFieldItems({
        sanitizedInput: '',
        items,
        editingIndex: 1,
        singleItemMode: false,
      });

      expect(result).toEqual(['a', 'c']);
    });
  });

  describe('adding items', () => {
    it('should append the new item', () => {
      const result = computeUpdatedMultiItemFieldItems({
        sanitizedInput: 'd',
        items,
        editingIndex: null,
        singleItemMode: false,
      });

      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should use formatInput to transform the value', () => {
      type Link = { url: string; label: string };
      const formatInput = jest.fn((input: string) => ({
        url: input,
        label: input,
      }));

      const result = computeUpdatedMultiItemFieldItems<Link>({
        sanitizedInput: 'example.com',
        items: [],
        editingIndex: null,
        singleItemMode: false,
        formatInput,
      });

      expect(formatInput).toHaveBeenCalledWith('example.com', undefined);
      expect(result).toEqual([{ url: 'example.com', label: 'example.com' }]);
    });
  });

  describe('editing items', () => {
    it('should replace at editingIndex', () => {
      const result = computeUpdatedMultiItemFieldItems({
        sanitizedInput: 'x',
        items,
        editingIndex: 1,
        singleItemMode: false,
      });

      expect(result).toEqual(['a', 'x', 'c']);
    });

    it('should pass editingIndex to formatInput', () => {
      const formatInput = jest.fn((input: string) => input);

      computeUpdatedMultiItemFieldItems({
        sanitizedInput: 'edited',
        items,
        editingIndex: 2,
        singleItemMode: false,
        formatInput,
      });

      expect(formatInput).toHaveBeenCalledWith('edited', 2);
    });
  });
});
