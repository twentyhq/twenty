import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/ui/hooks/useRecoilScopedState';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';

import { isEditModeScopedState } from '../states/isEditModeScopedState';

export function useCloseEditableCell() {
  const [, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );
  const [, setIsEditMode] = useRecoilScopedState(isEditModeScopedState);

  return useCallback(() => {
    setIsSomeInputInEditMode(false);
    setIsEditMode(false);
  }, [setIsEditMode, setIsSomeInputInEditMode]);
}
