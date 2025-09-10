import { useRecoilCallback } from 'recoil';
import { pageLayoutSelectedCellsState } from '../states/pageLayoutSelectedCellsState';

export const useChangePageLayoutDragSelection = () => {
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
    [],
  );

  return { changePageLayoutDragSelection };
};
