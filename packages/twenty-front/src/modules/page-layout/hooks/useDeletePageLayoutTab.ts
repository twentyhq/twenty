import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
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

  const { currentPageLayout } = useCurrentPageLayout();
  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

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
        if (!currentPageLayout) return;

        const sortedTabs = [...currentPageLayout.tabs].sort(
          (a, b) => a.position - b.position,
        );

        if (sortedTabs.length <= 1) return;

        const tabIndex = sortedTabs.findIndex((tab) => tab.id === tabId);
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
          const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
          const remainingTabs = sortedTabs.filter((tab) => tab.id !== tabId);
          const newActiveTab = remainingTabs[newActiveIndex];
          if (isDefined(newActiveTab)) {
            setActiveTabId(newActiveTab.id);
          }
        }
      },
    [
      currentPageLayout,
      activeTabIdState,
      setPageLayoutDraft,
      pageLayoutCurrentLayoutsState,
      setActiveTabId,
    ],
  );

  return { deletePageLayoutTab };
};
