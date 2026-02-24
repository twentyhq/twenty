import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { type Layout, type Layouts } from 'react-grid-layout';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { convertLayoutsToWidgets } from '@/page-layout/utils/convertLayoutsToWidgets';

export const usePageLayoutHandleLayoutChange = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const store = useStore();
  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const pageLayoutCurrentLayoutsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const handleLayoutChange = useCallback(
    (_: Layout[], allLayouts: Layouts) => {
      const activeTabId = store.get(
        activeTabIdComponentState.atomFamily({
          instanceId: tabListInstanceId,
        }),
      );

      if (!isDefined(activeTabId)) return;

      const currentTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      store.set(pageLayoutCurrentLayoutsState, {
        ...currentTabLayouts,
        [activeTabId]: structuredClone(allLayouts),
      });

      const pageLayoutDraft = store.get(pageLayoutDraftState);

      const currentTab = pageLayoutDraft.tabs.find(
        (tab) => tab.id === activeTabId,
      );

      if (!currentTab) return;

      const updatedWidgets = convertLayoutsToWidgets(
        currentTab.widgets,
        allLayouts,
      );

      if (isDefined(activeTabId)) {
        store.set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) => {
            if (tab.id === activeTabId) {
              const tabWidgets = updatedWidgets.filter(
                (w) => w.pageLayoutTabId === activeTabId,
              );
              return {
                ...tab,
                widgets: tabWidgets,
              };
            }
            return tab;
          }),
        }));
      }
    },
    [
      tabListInstanceId,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      store,
    ],
  );

  return { handleLayoutChange };
};
