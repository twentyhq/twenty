import { useInlineCell } from './useInlineCell';

export const useFieldInputEventHandlers = <T>({
  onSubmit,
  onCancel,
}: {
  onSubmit?: (newValue: T) => void;
  onCancel?: () => void;
}) => {
  const { closeInlineCell: closeEditableField, isInlineCellInEditMode } = useInlineCell();

  return {
    handleClickOutside: (_event: MouseEvent | TouchEvent, newValue: T) => {
      if (isInlineCellInEditMode) {
        onSubmit?.(newValue);
        closeEditableField();
      }
    },
    handleEscape: () => {
      closeEditableField();
      onCancel?.();
    },
    handleEnter: (newValue: T) => {
      onSubmit?.(newValue);
      closeEditableField();
    },
  };
};
