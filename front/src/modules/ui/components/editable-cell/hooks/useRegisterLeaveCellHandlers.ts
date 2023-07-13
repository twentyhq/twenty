import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';
import { useEditableCell } from './useEditableCell';

export function useRegisterLeaveCellHandlers(
  wrapperRef: React.RefObject<HTMLDivElement>,
  onLeave?: () => void,
) {
  const { closeEditableCell } = useEditableCell();
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();
  useListenClickOutsideArrayOfRef([wrapperRef], () => {
    if (isCurrentCellInEditMode) {
      onLeave?.();
      closeEditableCell();
    }
  });
  const { moveRight, moveLeft, moveDown } = useMoveSoftFocus();

  useScopedHotkeys(
    'enter',
    () => {
      onLeave?.();
      closeEditableCell();
      moveDown();
    },
    InternalHotkeysScope.CellEditMode,
    [closeEditableCell, onLeave, moveDown],
  );

  useScopedHotkeys(
    'esc',
    () => {
      closeEditableCell();
    },
    InternalHotkeysScope.CellEditMode,
    [closeEditableCell],
  );

  useScopedHotkeys(
    'tab',
    () => {
      onLeave?.();
      closeEditableCell();
      moveRight();
    },
    InternalHotkeysScope.CellEditMode,
    [closeEditableCell, onLeave, moveRight],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      onLeave?.();
      closeEditableCell();
      moveLeft();
    },
    InternalHotkeysScope.CellEditMode,
    [closeEditableCell, onLeave, moveRight],
  );
}
