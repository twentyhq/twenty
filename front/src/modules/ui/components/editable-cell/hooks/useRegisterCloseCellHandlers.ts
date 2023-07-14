import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { HotkeyScope } from '@/ui/tables/types/HotkeyScope';

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
    HotkeyScope.CellEditMode,
    [closeEditableCell, onSubmit, moveDown],
  );

  useScopedHotkeys(
    'esc',
    () => {
      closeEditableCell();
      onCancel?.();
    },
    HotkeyScope.CellEditMode,
    [closeEditableCell, onCancel],
  );

  useScopedHotkeys(
    'tab',
    () => {
      onSubmit?.();
      closeEditableCell();
      moveRight();
    },
    HotkeyScope.CellEditMode,
    [closeEditableCell, onSubmit, moveRight],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      onSubmit?.();
      closeEditableCell();
      moveLeft();
    },
    HotkeyScope.CellEditMode,
    [closeEditableCell, onSubmit, moveRight],
  );
}
