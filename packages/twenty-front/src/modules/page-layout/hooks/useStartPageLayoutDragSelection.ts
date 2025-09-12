import { useRecoilCallback } from 'recoil';
import { pageLayoutSelectedCellsState } from '../states/pageLayoutSelectedCellsState';

export const useStartPageLayoutDragSelection = () => {
  const startPageLayoutDragSelection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(pageLayoutSelectedCellsState, new Set());
      },
    [],
  );

  return { startPageLayoutDragSelection };
};
