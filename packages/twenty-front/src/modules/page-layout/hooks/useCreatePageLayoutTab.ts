import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { type PageLayoutTabWithData } from '../types/pageLayoutTypes';
import { createEmptyTabLayout } from '../utils/createEmptyTabLayout';

export const useCreatePageLayoutTab = () => {
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
    [],
  );

  return { createPageLayoutTab };
};
