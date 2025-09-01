import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { IconAppWindow } from 'twenty-ui/display';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutSelectedCellsState } from '../states/pageLayoutSelectedCellsState';
import { calculateGridBoundsFromSelectedCells } from '../utils/calculateGridBoundsFromSelectedCells';

export const usePageLayoutDragSelection = () => {
  const [pageLayoutSelectedCells, setPageLayoutSelectedCells] = useRecoilState(
    pageLayoutSelectedCellsState,
  );
  const setPageLayoutDraggedArea = useSetRecoilState(
    pageLayoutDraggedAreaState,
  );

  const { navigateCommandMenu } = useNavigateCommandMenu();
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

        navigateCommandMenu({
          page: CommandMenuPages.PageLayoutWidgetTypeSelect,
          pageTitle: 'Add Widget',
          pageIcon: IconAppWindow,
          resetNavigationStack: true,
        });

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
