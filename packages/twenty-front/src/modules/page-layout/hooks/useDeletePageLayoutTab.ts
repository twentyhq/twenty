import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useDeletePageLayoutTab = ({
  pageLayoutId: pageLayoutIdFromProps,
  tabListInstanceId,
}: {
  pageLayoutId: string;
  tabListInstanceId: string;
}) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const activeTabIdAtom = activeTabIdComponentState.atomFamily({
    instanceId: tabListInstanceId,
  });

  const deleteTab = useCallback(
    (tabId: string) => {
      const draft = store.get(pageLayoutDraftState);
      const activeTabs = draft.tabs.filter((t) => t.isActive);

      if (activeTabs.length <= 1) {
        return;
      }

      const sortedActiveTabs = sortTabsByPosition(activeTabs);
      const index = sortedActiveTabs.findIndex((t) => t.id === tabId);

      const activeTabId = store.get(activeTabIdAtom);

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === tabId ? { ...t, isActive: false } : t,
        ),
      }));

      if (activeTabId === tabId) {
        const neighbor =
          index > 0 ? sortedActiveTabs[index - 1] : sortedActiveTabs[index + 1];
        const nextActiveId = neighbor?.id ?? null;
        store.set(activeTabIdAtom, nextActiveId);
      }
    },
    [pageLayoutDraftState, activeTabIdAtom, store],
  );

  return { deleteTab };
};
