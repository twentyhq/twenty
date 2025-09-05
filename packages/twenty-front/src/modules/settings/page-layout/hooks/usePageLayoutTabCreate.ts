import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { type PageLayoutTab } from '../states/savedPageLayoutsState';
import { createEmptyTabLayout } from '../utils/createEmptyTabLayout';

export const usePageLayoutTabCreate = () => {
  const handleCreateTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (title?: string): string => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const newTabId = `tab-${uuidv4()}`;
        const newTab: PageLayoutTab = {
          id: newTabId,
          title: title || `Tab ${pageLayoutDraft.tabs.length + 1}`,
          position: pageLayoutDraft.tabs.length,
          pageLayoutId: '',
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        const updatedTabs = [...pageLayoutDraft.tabs, newTab];

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

  return { handleCreateTab };
};
