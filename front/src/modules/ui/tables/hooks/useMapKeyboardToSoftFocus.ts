import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';

import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useDisableSoftFocus } from './useDisableSoftFocus';
import { useMoveSoftFocus } from './useMoveSoftFocus';

export function useMapKeyboardToSoftFocus() {
  const { moveDown, moveLeft, moveRight, moveUp } = useMoveSoftFocus();

  const disableSoftFocus = useDisableSoftFocus();
  const setHotkeyScope = useSetHotkeyScope();

  const [isSomeInputInEditMode] = useRecoilState(isSomeInputInEditModeState);

  useScopedHotkeys(
    [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
    () => {
      if (!isSomeInputInEditMode) {
        moveUp();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [moveUp, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      if (!isSomeInputInEditMode) {
        moveDown();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [moveDown, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
    () => {
      if (!isSomeInputInEditMode) {
        moveLeft();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [moveLeft, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.ArrowRight, Key.Tab],
    () => {
      if (!isSomeInputInEditMode) {
        moveRight();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [moveRight, isSomeInputInEditMode],
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
