import { useEditableField } from './useEditableField';

export function useFieldInputEventHandlers<T>({
  onSubmit,
  onCancel,
}: {
  onSubmit?: (newValue: T) => void;
  onCancel?: () => void;
}) {
  const { closeEditableField, isFieldInEditMode } = useEditableField();

  return {
    handleClickOutside: (_event: MouseEvent | TouchEvent, newValue: T) => {
      if (isFieldInEditMode) {
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
}
