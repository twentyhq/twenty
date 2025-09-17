import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
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

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

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

            navigatePageLayoutCommandMenu({
              commandMenuPage: CommandMenuPages.PageLayoutWidgetTypeSelect,
            });
          }
        }

        set(pageLayoutSelectedCellsState, new Set());
      },
    [
      navigatePageLayoutCommandMenu,
      pageLayoutDraggedAreaState,
      pageLayoutSelectedCellsState,
    ],
  );

  return { endPageLayoutDragSelection };
};
