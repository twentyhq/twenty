import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';
import { calculateGridBoundsFromSelectedCells } from '@/page-layout/utils/calculateGridBoundsFromSelectedCells';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

  const pageLayoutEditingWidgetIdState = useRecoilComponentCallbackState(
    pageLayoutEditingWidgetIdComponentState,
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
            set(pageLayoutEditingWidgetIdState, null);

            navigatePageLayoutCommandMenu({
              commandMenuPage: CommandMenuPages.PageLayoutWidgetTypeSelect,
              resetNavigationStack: true,
            });
          }
        }

        set(pageLayoutSelectedCellsState, new Set());
      },
    [
      navigatePageLayoutCommandMenu,
      pageLayoutDraggedAreaState,
      pageLayoutEditingWidgetIdState,
      pageLayoutSelectedCellsState,
    ],
  );

  return { endPageLayoutDragSelection };
};
