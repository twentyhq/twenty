import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useDisableSoftFocus } from './useDisableSoftFocus';
import { useMoveSoftFocus } from './useMoveSoftFocus';

export function useMapKeyboardToSoftFocus() {
  const { moveDown, moveLeft, moveRight, moveUp } = useMoveSoftFocus();

  const disableSoftFocus = useDisableSoftFocus();
  const setHotkeyScope = useSetHotkeyScope();

  useScopedHotkeys(
    [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
    () => {
      moveUp();
    },
    TableHotkeyScope.TableSoftFocus,
    [moveUp],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      moveDown();
    },
    TableHotkeyScope.TableSoftFocus,
    [moveDown],
  );

  useScopedHotkeys(
    [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
    () => {
      moveLeft();
    },
    TableHotkeyScope.TableSoftFocus,
    [moveLeft],
  );

  useScopedHotkeys(
    [Key.ArrowRight, Key.Tab],
    () => {
      moveRight();
    },
    TableHotkeyScope.TableSoftFocus,
    [moveRight],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      setHotkeyScope(TableHotkeyScope.Table, { goto: true });
      disableSoftFocus();
    },
    TableHotkeyScope.TableSoftFocus,
    [disableSoftFocus],
  );
}
