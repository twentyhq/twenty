import { useHotkeys } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';

import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';

import { useMoveSoftFocus } from './useMoveSoftFocus';

export function useMapKeyboardToSoftFocus() {
  const { moveDown, moveLeft, moveRight, moveUp } = useMoveSoftFocus();

  const [isSomeInputInEditMode] = useRecoilState(isSomeInputInEditModeState);

  useHotkeys(
    'up, shift+enter',
    () => {
      if (!isSomeInputInEditMode) {
        moveUp();
      }
    },
    [moveUp, isSomeInputInEditMode],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
  );

  useHotkeys(
    'down',
    () => {
      if (!isSomeInputInEditMode) {
        moveDown();
      }
    },
    [moveDown, isSomeInputInEditMode],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
  );

  useHotkeys(
    ['left', 'shift+tab'],
    () => {
      if (!isSomeInputInEditMode) {
        moveLeft();
      }
    },
    [moveLeft, isSomeInputInEditMode],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
  );

  useHotkeys(
    ['right', 'tab'],
    () => {
      if (!isSomeInputInEditMode) {
        moveRight();
      }
    },
    [moveRight, isSomeInputInEditMode],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
  );
}
