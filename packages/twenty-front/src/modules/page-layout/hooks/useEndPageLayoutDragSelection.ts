import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';
import { calculateGridBoundsFromSelectedCells } from '@/page-layout/utils/calculateGridBoundsFromSelectedCells';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useEndPageLayoutDragSelection = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutSelectedCellsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutSelectedCellsComponentState,
    pageLayoutId,
  );
  const pageLayoutDraggedAreaState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useRecoilComponentStateCallbackStateV2(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

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

        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutWidgetTypeSelect,
          resetNavigationStack: true,
        });
      }
    }

    store.set(pageLayoutSelectedCellsState, new Set());
  }, [
    navigatePageLayoutCommandMenu,
    pageLayoutDraggedAreaState,
    pageLayoutEditingWidgetIdState,
    pageLayoutSelectedCellsState,
    store,
  ]);

  return { endPageLayoutDragSelection };
};
