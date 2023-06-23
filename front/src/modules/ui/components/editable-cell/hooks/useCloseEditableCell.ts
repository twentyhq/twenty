import { useCallback, useMemo } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';
import { debounce } from '@/utils/debounce';

import { isEditModeScopedState } from '../states/isEditModeScopedState';

import { useSoftFocusOnCurrentCell } from './useSoftFocusOnCurrentCell';

export function useEditableCell() {
  const [isSomeInputInEditMode, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );
  const [, setIsEditMode] = useRecoilScopedState(isEditModeScopedState);
  const { enableScope, disableScope } = useHotkeysContext();
  const [, setSoftFocusOnCurrentCell] = useSoftFocusOnCurrentCell();

  const debouncedSetIsSomeInputInEditMode = useMemo(() => {
    return debounce(setIsSomeInputInEditMode, 20);
  }, [setIsSomeInputInEditMode]);

  const closeEditableCell = useCallback(() => {
    debouncedSetIsSomeInputInEditMode(false);
    setIsEditMode(false);
    enableScope('entity-table');
  }, [setIsEditMode, debouncedSetIsSomeInputInEditMode, enableScope]);

  const openEditableCell = useCallback(() => {
    if (!isSomeInputInEditMode) {
      debouncedSetIsSomeInputInEditMode(true);
      setIsEditMode(true);
      setSoftFocusOnCurrentCell();
      disableScope('entity-table');
    }
  }, [
    setIsEditMode,
    debouncedSetIsSomeInputInEditMode,
    disableScope,
    setSoftFocusOnCurrentCell,
    isSomeInputInEditMode,
  ]);

  return {
    closeEditableCell,
    openEditableCell,
  };
}
