import { useHotkeysContext } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useRemoveAppFocus } from '@/app-focus/hooks/useRemoveAppFocus';
import { useDirectHotkeys } from '@/hotkeys/hooks/useDirectHotkeys';

import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';

import { useDisableSoftFocus } from './useDisableSoftFocus';
import { useMoveSoftFocus } from './useMoveSoftFocus';

export function useMapKeyboardToSoftFocus() {
  console.log('useMapKeyboardToSoftFocus');
  const { moveDown, moveLeft, moveRight, moveUp } = useMoveSoftFocus();

  const removeAppFocus = useRemoveAppFocus();
  const disableSoftFocus = useDisableSoftFocus();

  const { enabledScopes } = useHotkeysContext();

  console.log({ enabledScopes });

  const [isSomeInputInEditMode] = useRecoilState(isSomeInputInEditModeState);

  useDirectHotkeys(
    [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
    () => {
      if (!isSomeInputInEditMode) {
        moveUp();
      }
    },
    ['table-body'],
    [moveUp, isSomeInputInEditMode],
  );

  useDirectHotkeys(
    Key.ArrowDown,
    () => {
      console.log('down', { enabledScopes });
      if (!isSomeInputInEditMode) {
        moveDown();
      }
    },
    ['table-body'],
    [moveDown, isSomeInputInEditMode, enabledScopes],
  );

  useDirectHotkeys(
    [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
    () => {
      if (!isSomeInputInEditMode) {
        moveLeft();
      }
    },
    ['table-body'],
    [moveLeft, isSomeInputInEditMode],
  );

  useDirectHotkeys(
    [Key.ArrowRight, Key.Tab],
    () => {
      if (!isSomeInputInEditMode) {
        moveRight();
      }
    },
    ['table-body'],
    [moveRight, isSomeInputInEditMode],
  );

  useDirectHotkeys(
    [Key.Escape],
    () => {
      console.log('escape');
      removeAppFocus('table-body');
      disableSoftFocus();
    },
    ['table-body'],
    [removeAppFocus, disableSoftFocus],
  );
}
