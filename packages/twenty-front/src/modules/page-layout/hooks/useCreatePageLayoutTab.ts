import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutCurrentLayoutsComponentState } from '../states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '../states/pageLayoutDraftComponentState';
import { type PageLayoutTabWithData } from '../types/pageLayoutTypes';
import { createEmptyTabLayout } from '../utils/createEmptyTabLayout';

export const useCreatePageLayoutTab = (pageLayoutId: string) => {
  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutInstanceId,
  );

  const createPageLayoutTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (title?: string): string => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const newTabId = `tab-${uuidv4()}`;
        const tabsLength = pageLayoutDraft.tabs.length;
        const newTab: PageLayoutTabWithData = {
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
          createEmptyTabLayout(prev, newTabId),
        );

        return newTabId;
      },
    [pageLayoutCurrentLayoutsState, pageLayoutDraftState],
  );

  return { createPageLayoutTab };
};
