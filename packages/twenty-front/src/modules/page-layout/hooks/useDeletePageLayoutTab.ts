import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { removeTabLayouts } from '@/page-layout/utils/removeTabLayouts';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useDeletePageLayoutTab = (pageLayoutIdFromProps?: string) => {
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

  const store = useStore();
  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const activeTabIdAtom = activeTabIdComponentState.atomFamily({
    instanceId: tabListInstanceId,
  });

  const deleteTab = useCallback(
    (tabId: string) => {
      const draft = store.get(pageLayoutDraftState);
      if (draft.tabs.length <= 1) {
        return;
      }

      const sorted = sortTabsByPosition(draft.tabs);
      const index = sorted.findIndex((t) => t.id === tabId);

      const activeTabId = store.get(activeTabIdAtom);

      const allLayouts = store.get(pageLayoutCurrentLayoutsState);
      const updatedLayouts = removeTabLayouts(allLayouts, tabId);
      store.set(pageLayoutCurrentLayoutsState, updatedLayouts);

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: prev.tabs.filter((t) => t.id !== tabId),
      }));

      if (activeTabId === tabId) {
        const neighbor = index > 0 ? sorted[index - 1] : sorted[index + 1];
        const nextActiveId = neighbor?.id ?? null;
        store.set(activeTabIdAtom, nextActiveId);
      }
    },
    [
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      activeTabIdAtom,
      store,
    ],
  );

  return { deleteTab };
};
