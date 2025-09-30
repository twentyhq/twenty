import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
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

  const createPageLayoutTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (title?: string): string => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const newTabId = `tab-${uuidv4()}`;
        const tabsLength = pageLayoutDraft.tabs.length;
        const newTab: PageLayoutTab = {
          id: newTabId,
          title: title || `Tab ${tabsLength + 1}`,
          position: tabsLength,
          pageLayoutId: '',
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

        return newTabId;
      },
    [pageLayoutCurrentLayoutsState, pageLayoutDraftState],
  );

  return { createPageLayoutTab };
};
