import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';

import { useMoveSoftFocus } from '../../hooks/useMoveSoftFocus';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';
import { useEditableCell } from './useEditableCell';

export function useRegisterCloseCellHandlers(
  wrapperRef: React.RefObject<HTMLDivElement>,
  onSubmit?: () => void,
  onCancel?: () => void,
) {
  const { closeEditableCell } = useEditableCell();
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();
  useListenClickOutsideArrayOfRef({
    refs: [wrapperRef],
    callback: () => {
      if (isCurrentCellInEditMode) {
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
}
