import { type SelectionBox } from '@/ui/utilities/drag-select/types/SelectionBox';
import { isValidSelectionStart } from '@/ui/utilities/drag-select/utils/selectionBoxValidation';

describe('selectionBoxValidation', () => {
  describe('isValidSelectionStart', () => {
    it('should return true for selection box with minimum valid size', () => {
      const selectionBox: SelectionBox = {
        top: 10,
        left: 10,
        width: 5,
        height: 5,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(true);
    });

    it('should return false for selection box with zero width', () => {
      const selectionBox: SelectionBox = {
        top: 10,
        left: 10,
        width: 0,
        height: 5,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(false);
    });

    it('should return false for selection box with zero height', () => {
      const selectionBox: SelectionBox = {
        top: 10,
        left: 10,
        width: 5,
        height: 0,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(false);
    });

    it('should return false for selection box with both zero width and height', () => {
      const selectionBox: SelectionBox = {
        top: 10,
        left: 10,
        width: 0,
        height: 0,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(false);
    });

    it('should return true for large selection box', () => {
      const selectionBox: SelectionBox = {
        top: 0,
        left: 0,
        width: 1000,
        height: 800,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(true);
    });

    it('should handle negative dimensions', () => {
      const selectionBox: SelectionBox = {
        top: 10,
        left: 10,
        width: -5,
        height: 5,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(false);
    });

    it('should handle fractional dimensions', () => {
      const selectionBox: SelectionBox = {
        top: 10.5,
        left: 10.5,
        width: 2.3,
        height: 3.7,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(false);
    });

    it('should return true for fractional dimensions with large area', () => {
      const selectionBox: SelectionBox = {
        top: 10.5,
        left: 10.5,
        width: 4.0,
        height: 3.0,
      };

      expect(isValidSelectionStart(selectionBox)).toBe(true);
    });
  });
});
