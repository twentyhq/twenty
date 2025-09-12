import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { pageLayoutSelectedCellsComponentState } from '../states/pageLayoutSelectedCellsComponentState';

export const useChangePageLayoutDragSelection = () => {
  const pageLayoutSelectedCellsState = useRecoilComponentCallbackState(
    pageLayoutSelectedCellsComponentState,
  );

  const changePageLayoutDragSelection = useRecoilCallback(
    ({ set }) =>
      (cellId: string, selected: boolean) => {
        set(pageLayoutSelectedCellsState, (prev) => {
          const newSet = new Set(prev);
          if (selected) {
            newSet.add(cellId);
          } else {
            newSet.delete(cellId);
          }
          return newSet;
        });
      },
    [pageLayoutSelectedCellsState],
  );

  return { changePageLayoutDragSelection };
};
