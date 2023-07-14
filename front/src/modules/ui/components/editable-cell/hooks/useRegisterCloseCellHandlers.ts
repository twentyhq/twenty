import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';
import { useEditableCell } from './useEditableCell';

export function useRegisterCloseCellHandlers(
  wrapperRef: React.RefObject<HTMLDivElement>,
  onSubmit?: () => void,
  onCancel?: () => void,
) {
  const { closeEditableCell } = useEditableCell();
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();
  useListenClickOutsideArrayOfRef([wrapperRef], () => {
    if (isCurrentCellInEditMode) {
      onSubmit?.();
      closeEditableCell();
    }
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
