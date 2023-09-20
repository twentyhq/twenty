import { useCurrentCellEditMode } from '@/ui/table/editable-cell/hooks/useCurrentCellEditMode';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { useMoveSoftFocus } from '@/ui/table/hooks/useMoveSoftFocus';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

export const useRegisterCloseCellHandlers = (
  wrapperRef: React.RefObject<HTMLDivElement>,
  onSubmit?: () => void,
  onCancel?: () => void,
) => {
  const { closeEditableCell } = useEditableCell();
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();

  useListenClickOutside({
    refs: [wrapperRef],
    callback: (event) => {
      if (isCurrentCellInEditMode) {
        event.stopImmediatePropagation();

        onSubmit?.();

        closeEditableCell();
      }
    },
  });

  const { moveRight, moveLeft, moveDown } = useMoveSoftFocus();

  useScopedHotkeys(
    'enter',
    () => {
      onSubmit?.();
      closeEditableCell();
      moveDown();
    },
    TableHotkeyScope.CellEditMode,
    [closeEditableCell, onSubmit, moveDown],
  );

  useScopedHotkeys(
    'esc',
    () => {
      closeEditableCell();
      onCancel?.();
    },
    TableHotkeyScope.CellEditMode,
    [closeEditableCell, onCancel],
  );

  useScopedHotkeys(
    'tab',
    () => {
      onSubmit?.();
      closeEditableCell();
      moveRight();
    },
    TableHotkeyScope.CellEditMode,
    [closeEditableCell, onSubmit, moveRight],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      onSubmit?.();
      closeEditableCell();
      moveLeft();
    },
    TableHotkeyScope.CellEditMode,
    [closeEditableCell, onSubmit, moveRight],
  );
};
