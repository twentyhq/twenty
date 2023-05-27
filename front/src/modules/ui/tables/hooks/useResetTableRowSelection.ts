import { useSetRecoilState } from 'recoil';
import { currentRowSelectionState } from '../states/rowSelectionState';
import { useCallback, useMemo } from 'react';

export function useResetTableRowSelection() {
  const setCurrentRowSelectionState = useSetRecoilState(
    currentRowSelectionState,
  );

  return useCallback(
    function resetCurrentRowSelection() {
      setCurrentRowSelectionState({});
    },
    [setCurrentRowSelectionState],
  );
}
