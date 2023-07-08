import { useRecoilCallback } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { BoardCardFieldContext } from '../states/BoardCardFieldContext';
import { isBoardCardFieldInEditModeScopedState } from '../states/isBoardCardFieldInEditModeScopedState';

export function useBoardCardField() {
  const [isBoardCardFieldInEditMode, setIsBoardCardFieldInEditMode] =
    useRecoilScopedState(
      isBoardCardFieldInEditModeScopedState,
      BoardCardFieldContext,
    );

  function openBoardCardField() {
    setIsBoardCardFieldInEditMode(true);
  }

  function closeBoardCardField() {
    setIsBoardCardFieldInEditMode(false);
  }

  return {
    isBoardCardFieldInEditMode,
    openBoardCardField,
    closeBoardCardField,
  };
}
