import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconAppWindow } from 'twenty-ui/display';
import { pageLayoutSelectedCellsComponentState } from '../states/pageLayoutSelectedCellsComponentState';
import { calculateGridBoundsFromSelectedCells } from '../utils/calculateGridBoundsFromSelectedCells';

export const useEndPageLayoutDragSelection = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutSelectedCellsState = useRecoilComponentCallbackState(
    pageLayoutSelectedCellsComponentState,
    pageLayoutId,
  );
  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
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
