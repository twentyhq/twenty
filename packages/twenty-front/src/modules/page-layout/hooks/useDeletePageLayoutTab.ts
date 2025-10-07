import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { findNextActiveTabAfterDelete } from '@/page-layout/utils/findNextActiveTabAfterDelete';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useDeletePageLayoutTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const activeTabIdState = useRecoilComponentCallbackState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const deletePageLayoutTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (tabId: string) => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        if (!pageLayoutDraft) return;

        if (pageLayoutDraft.tabs.length <= 1) return;

        const currentActiveTabId = snapshot
          .getLoadable(activeTabIdState)
          .getValue();

        setPageLayoutDraft((prev) => ({
          ...prev,
          tabs: prev.tabs.filter((tab) => tab.id !== tabId),
        }));

        set(pageLayoutCurrentLayoutsState, (prev) => {
          const { [tabId]: _removed, ...remaining } = prev;
          return remaining;
        });

        if (currentActiveTabId === tabId) {
          const nextActiveTabId = findNextActiveTabAfterDelete({
            tabs: pageLayoutDraft.tabs,
            deletedTabId: tabId,
          });

          if (isDefined(nextActiveTabId)) {
            setActiveTabId(nextActiveTabId);
          }
        }
      },
    [
      pageLayoutDraftState,
      activeTabIdState,
      setPageLayoutDraft,
      pageLayoutCurrentLayoutsState,
      setActiveTabId,
    ],
  );

  return { deletePageLayoutTab };
};
