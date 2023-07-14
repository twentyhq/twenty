import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { useSetHotkeysScope } from '@/lib/hotkeys/hooks/useSetHotkeysScope';

import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';
import { HotkeyScope } from '../types/HotkeyScope';

import { useDisableSoftFocus } from './useDisableSoftFocus';
import { useMoveSoftFocus } from './useMoveSoftFocus';

export function useMapKeyboardToSoftFocus() {
  const { moveDown, moveLeft, moveRight, moveUp } = useMoveSoftFocus();

  const disableSoftFocus = useDisableSoftFocus();
  const setHotkeysScope = useSetHotkeysScope();

  const [isSomeInputInEditMode] = useRecoilState(isSomeInputInEditModeState);

  useScopedHotkeys(
    [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
    () => {
      if (!isSomeInputInEditMode) {
        moveUp();
      }
    },
    HotkeyScope.TableSoftFocus,
    [moveUp, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      if (!isSomeInputInEditMode) {
        moveDown();
      }
    },
    HotkeyScope.TableSoftFocus,
    [moveDown, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
    () => {
      if (!isSomeInputInEditMode) {
        moveLeft();
      }
    },
    HotkeyScope.TableSoftFocus,
    [moveLeft, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.ArrowRight, Key.Tab],
    () => {
      if (!isSomeInputInEditMode) {
        moveRight();
      }
    },
    HotkeyScope.TableSoftFocus,
    [moveRight, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      setHotkeysScope(HotkeyScope.Table, { goto: true });
      disableSoftFocus();
    },
    HotkeyScope.TableSoftFocus,
    [disableSoftFocus],
  );
}
