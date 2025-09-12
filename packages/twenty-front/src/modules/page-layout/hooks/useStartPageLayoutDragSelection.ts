import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { pageLayoutSelectedCellsComponentState } from '../states/pageLayoutSelectedCellsComponentState';

export const useStartPageLayoutDragSelection = () => {
  const pageLayoutSelectedCellsState = useRecoilComponentCallbackState(
    pageLayoutSelectedCellsComponentState,
  );

  const startPageLayoutDragSelection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(pageLayoutSelectedCellsState, new Set());
      },
    [pageLayoutSelectedCellsState],
  );

  return { startPageLayoutDragSelection };
};
