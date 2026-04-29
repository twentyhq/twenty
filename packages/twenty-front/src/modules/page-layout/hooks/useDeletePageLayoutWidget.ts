import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDeletePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { closeSidePanelMenu } = useSidePanelMenu();

  const store = useStore();

  const deletePageLayoutWidget = useCallback(
    (widgetId: string) => {
      closeSidePanelMenu();

      const pageLayoutDraft = store.get(pageLayoutDraftState);
      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const tabWithWidget = pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((widget) => widget.id === widgetId),
      );

      const tabId = tabWithWidget?.id;

      if (isDefined(tabId)) {
        const updatedLayouts = removeWidgetLayoutFromTab(
          allTabLayouts,
          tabId,
          widgetId,
        );
        store.set(pageLayoutCurrentLayoutsState, updatedLayouts);

        store.set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: removeWidgetFromTab(prev.tabs, tabId, widgetId),
        }));
      }

      const pageLayoutEditingWidgetId = store.get(
        pageLayoutEditingWidgetIdState,
      );

      if (pageLayoutEditingWidgetId === widgetId) {
        store.set(pageLayoutEditingWidgetIdState, null);
      }
    },
    [
      closeSidePanelMenu,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutEditingWidgetIdState,
      store,
    ],
  );

  return { deletePageLayoutWidget };
};
