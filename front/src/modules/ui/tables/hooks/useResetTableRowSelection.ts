import { useSetRecoilState } from 'recoil';
import { currentRowSelectionState } from '../states/rowSelectionState';

export function useResetTableRowSelection() {
  const setCurrentRowSelectionState = useSetRecoilState(
    currentRowSelectionState,
  );

  return function resetCurrentRowSelection() {
    setCurrentRowSelectionState({});
  };
}
