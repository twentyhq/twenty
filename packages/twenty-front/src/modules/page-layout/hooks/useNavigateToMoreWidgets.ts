import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

export const useNavigateToMoreWidgets = () => {
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
  );

  const widgetInsertionContextState = useAtomComponentStateCallbackState(
    widgetInsertionContextComponentState,
  );

  const store = useStore();

  const navigateToMoreWidgets = useCallback(() => {
    store.set(pageLayoutEditingWidgetIdState, null);
    store.set(widgetInsertionContextState, null);

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    });
  }, [
    navigatePageLayoutSidePanel,
    pageLayoutEditingWidgetIdState,
    store,
    widgetInsertionContextState,
  ]);

  return { navigateToMoreWidgets };
};
