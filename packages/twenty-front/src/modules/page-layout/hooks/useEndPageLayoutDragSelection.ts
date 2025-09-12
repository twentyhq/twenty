import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconAppWindow } from 'twenty-ui/display';
import { pageLayoutSelectedCellsComponentState } from '../states/pageLayoutSelectedCellsComponentState';
import { calculateGridBoundsFromSelectedCells } from '../utils/calculateGridBoundsFromSelectedCells';

export const useEndPageLayoutDragSelection = (pageLayoutId: string) => {
  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const pageLayoutSelectedCellsState = useRecoilComponentCallbackState(
    pageLayoutSelectedCellsComponentState,
    pageLayoutInstanceId,
  );
  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutInstanceId,
  );
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
    [
      navigateCommandMenu,
      pageLayoutDraggedAreaState,
      pageLayoutSelectedCellsState,
    ],
  );

  return { endPageLayoutDragSelection };
};
