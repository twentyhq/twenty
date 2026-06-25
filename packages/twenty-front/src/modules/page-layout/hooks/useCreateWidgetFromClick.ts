import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { parseCellIdToCoordinates } from '@/page-layout/utils/parseCellIdToCoordinates';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

export const useCreateWidgetFromClick = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
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

  const createWidgetFromClick = useCallback(
    (cellId: string) => {
      const { col, row } = parseCellIdToCoordinates(cellId);
      const bounds = { x: col, y: row, w: 1, h: 1 };

      store.set(pageLayoutDraggedAreaState, bounds);
      store.set(pageLayoutEditingWidgetIdState, null);

      navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
        resetNavigationStack: true,
      });
    },
    [
      navigatePageLayoutSidePanel,
      pageLayoutDraggedAreaState,
      pageLayoutEditingWidgetIdState,
      store,
    ],
  );

  return { createWidgetFromClick };
};
