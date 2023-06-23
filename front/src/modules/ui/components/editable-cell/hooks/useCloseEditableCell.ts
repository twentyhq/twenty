import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/ui/hooks/useRecoilScopedState';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';
import { debounce } from '@/utils/debounce';

import { isEditModeScopedState } from '../states/isEditModeScopedState';

export function useCloseEditableCell() {
  const [, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );
  const [, setIsEditMode] = useRecoilScopedState(isEditModeScopedState);

  const debouncedSetIsSomeInputInEditMode = useMemo(() => {
    return debounce(setIsSomeInputInEditMode, 20);
  }, [setIsSomeInputInEditMode]);

  return useCallback(() => {
    debouncedSetIsSomeInputInEditMode(false);
    setIsEditMode(false);
  }, [setIsEditMode, debouncedSetIsSomeInputInEditMode]);
}
