import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconAppWindow } from 'twenty-ui/display';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutSelectedCellsState } from '../states/pageLayoutSelectedCellsState';
import { calculateGridBoundsFromSelectedCells } from '../utils/calculateGridBoundsFromSelectedCells';

export const useEndPageLayoutDragSelection = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const endPageLayoutDragSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const pageLayoutSelectedCells = snapshot
          .getLoadable(pageLayoutSelectedCellsState)
          .getValue();

        if (pageLayoutSelectedCells.size > 0) {
          const draggedBounds = calculateGridBoundsFromSelectedCells(
            Array.from(pageLayoutSelectedCells),
          );

          if (isDefined(draggedBounds)) {
            set(pageLayoutDraggedAreaState, draggedBounds);

            navigateCommandMenu({
              page: CommandMenuPages.PageLayoutWidgetTypeSelect,
              pageTitle: 'Add Widget',
              pageIcon: IconAppWindow,
              resetNavigationStack: true,
            });

            set(pageLayoutSelectedCellsState, new Set());
          }
        }
      },
    [navigateCommandMenu],
  );

  return { endPageLayoutDragSelection };
};
