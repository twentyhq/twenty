import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { removeTabLayouts } from '@/page-layout/utils/removeTabLayouts';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useStore } from 'jotai';
import { useRecoilCallback } from 'recoil';

export const useDeletePageLayoutTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const store = useStore();
  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const activeTabIdAtom = activeTabIdComponentState.atomFamily({
    instanceId: tabListInstanceId,
  });

  const deleteTab = useRecoilCallback(
    ({ set, snapshot }) =>
      (tabId: string) => {
        const draft = snapshot.getLoadable(pageLayoutDraftState).getValue();
        if (draft.tabs.length <= 1) {
          return;
        }

        const sorted = sortTabsByPosition(draft.tabs);
        const index = sorted.findIndex((t) => t.id === tabId);

        const activeTabId = store.get(activeTabIdAtom);

        const allLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();
        const updatedLayouts = removeTabLayouts(allLayouts, tabId);
        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutDraftState, (prev) => ({
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
