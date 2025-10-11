import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutCurrentLayoutsComponentState } from '../states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '../states/pageLayoutDraftComponentState';
import { type PageLayoutTab } from '../types/PageLayoutTab';
import { getEmptyTabLayout } from '../utils/getEmptyTabLayout';

export const useCreatePageLayoutTab = (pageLayoutIdFromProps?: string) => {
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

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);
  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const createPageLayoutTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (title?: string): void => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const newTabId = uuidv4();
        const tabsLength = pageLayoutDraft.tabs.length;
        const newTab: PageLayoutTab = {
          id: newTabId,
          title: title || `Tab ${tabsLength + 1}`,
          position: tabsLength,
          pageLayoutId: pageLayoutId,
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        const updatedTabs = [...(pageLayoutDraft.tabs || []), newTab];

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: updatedTabs,
        }));

        set(pageLayoutCurrentLayoutsState, (prev) =>
          getEmptyTabLayout(prev, newTabId),
        );

        setActiveTabId(newTabId);
      },
    [
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutId,
      setActiveTabId,
    ],
  );

  return { createPageLayoutTab };
};
