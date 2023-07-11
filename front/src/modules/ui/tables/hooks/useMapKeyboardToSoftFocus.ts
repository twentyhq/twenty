import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';

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
    InternalHotkeysScope.TableSoftFocus,
    [moveUp, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      if (!isSomeInputInEditMode) {
        moveDown();
      }
    },
    InternalHotkeysScope.TableSoftFocus,
    [moveDown, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
    () => {
      if (!isSomeInputInEditMode) {
        moveLeft();
      }
    },
    InternalHotkeysScope.TableSoftFocus,
    [moveLeft, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.ArrowRight, Key.Tab],
    () => {
      if (!isSomeInputInEditMode) {
        moveRight();
      }
    },
    InternalHotkeysScope.TableSoftFocus,
    [moveRight, isSomeInputInEditMode],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      setHotkeysScope(InternalHotkeysScope.Table, { goto: true });
      disableSoftFocus();
    },
    InternalHotkeysScope.TableSoftFocus,
    [disableSoftFocus],
  );
}
