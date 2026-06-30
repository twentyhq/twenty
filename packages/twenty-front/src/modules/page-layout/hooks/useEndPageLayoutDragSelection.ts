import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';
import { calculateGridBoundsFromSelectedCells } from '@/page-layout/utils/calculateGridBoundsFromSelectedCells';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useEndPageLayoutDragSelection = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutSelectedCellsState = useAtomComponentStateCallbackState(
    pageLayoutSelectedCellsComponentState,
    pageLayoutId,
  );
  const pageLayoutDraggedAreaState = useAtomComponentStateCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const store = useStore();

  const endPageLayoutDragSelection = useCallback(() => {
    const pageLayoutSelectedCells = store.get(pageLayoutSelectedCellsState);

    if (pageLayoutSelectedCells.size > 0) {
      const draggedBounds = calculateGridBoundsFromSelectedCells(
        Array.from(pageLayoutSelectedCells),
      );

      if (isDefined(draggedBounds)) {
        store.set(pageLayoutDraggedAreaState, draggedBounds);
        store.set(pageLayoutEditingWidgetIdState, null);

        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
          resetNavigationStack: true,
        });
      }
    }

    store.set(pageLayoutSelectedCellsState, new Set());
  }, [
    navigatePageLayoutSidePanel,
    pageLayoutDraggedAreaState,
    pageLayoutEditingWidgetIdState,
    pageLayoutSelectedCellsState,
    store,
  ]);

  return { endPageLayoutDragSelection };
};
