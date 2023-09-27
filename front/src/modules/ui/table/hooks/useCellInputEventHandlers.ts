import { useCurrentTableCellEditMode } from '../editable-cell/hooks/useCurrentTableCellEditMode';
import { useTableCell } from '../editable-cell/hooks/useTableCell';

import { useMoveSoftFocus } from './useMoveSoftFocus';

export const useCellInputEventHandlers = <T>({
  onSubmit,
  onCancel,
}: {
  onSubmit?: (newValue: T) => void;
  onCancel?: () => void;
}) => {
  const { closeTableCell: closeEditableCell } = useTableCell();
  const { isCurrentTableCellInEditMode: isCurrentCellInEditMode } =
    useCurrentTableCellEditMode();
  const { moveRight, moveLeft, moveDown } = useMoveSoftFocus();

  return {
    handleClickOutside: (event: MouseEvent | TouchEvent, newValue: T) => {
      if (isCurrentCellInEditMode) {
        event.stopImmediatePropagation();

        onSubmit?.(newValue);

        closeEditableCell();
      }
    },
    handleEscape: () => {
      closeEditableCell();
      onCancel?.();
    },
    handleEnter: (newValue: T) => {
      onSubmit?.(newValue);
      closeEditableCell();
      moveDown();
    },
    handleTab: (newValue: T) => {
      onSubmit?.(newValue);
      closeEditableCell();
      moveRight();
    },
    handleShiftTab: (newValue: T) => {
      onSubmit?.(newValue);
      closeEditableCell();
      moveLeft();
    },
  };
};
