import { useRecoilState } from 'recoil';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutSelectedCellsState } from '../states/pageLayoutSelectedCellsState';
import { pageLayoutSidePanelOpenState } from '../states/pageLayoutSidePanelOpenState';
import { calculateGridBoundsFromSelectedCells } from '../utils/calculateGridBoundsFromSelectedCells';

export const usePageLayoutDragSelection = () => {
  const [pageLayoutSelectedCells, setPageLayoutSelectedCells] = useRecoilState(
    pageLayoutSelectedCellsState,
  );
  const [, setPageLayoutDraggedArea] = useRecoilState(
    pageLayoutDraggedAreaState,
  );
  const [, setPageLayoutSidePanelOpen] = useRecoilState(
    pageLayoutSidePanelOpenState,
  );

  const handleDragSelectionStart = () => {
    setPageLayoutSelectedCells(new Set());
  };

  const handleDragSelectionChange = (cellId: string, selected: boolean) => {
    setPageLayoutSelectedCells((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(cellId);
      } else {
        newSet.delete(cellId);
      }
      return newSet;
    });
  };

  const handleDragSelectionEnd = () => {
    if (pageLayoutSelectedCells.size > 0) {
      const draggedBounds = calculateGridBoundsFromSelectedCells(
        Array.from(pageLayoutSelectedCells),
      );

      if (draggedBounds !== null) {
        setPageLayoutDraggedArea(draggedBounds);
        setPageLayoutSidePanelOpen(true);
        setPageLayoutSelectedCells(new Set());
      }
    }
  };

  return {
    pageLayoutSelectedCells,
    handleDragSelectionStart,
    handleDragSelectionChange,
    handleDragSelectionEnd,
  };
};
