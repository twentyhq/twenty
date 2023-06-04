import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentRowSelectionState } from '../states/rowSelectionState';

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
