import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';

export const useDeletePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const { closeCommandMenu } = useCommandMenu();

  const store = useStore();

  const deletePageLayoutWidget = useCallback(
    (widgetId: string) => {
      closeCommandMenu();

      const pageLayoutDraft = store.get(pageLayoutDraftState);
      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const tabWithWidget = pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((w) => w.id === widgetId),
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
    },
    [
      closeCommandMenu,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      store,
    ],
  );

  return { deletePageLayoutWidget };
};
