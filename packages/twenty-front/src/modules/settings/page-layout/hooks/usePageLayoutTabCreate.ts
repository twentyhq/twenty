import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { type PageLayoutTab } from '../states/savedPageLayoutsState';
import { createEmptyTabLayout } from '../utils/createEmptyTabLayout';

export const usePageLayoutTabCreate = () => {
  const handleCreateTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (title?: string): string => {
        const pageLayoutTabs = snapshot
          .getLoadable(pageLayoutTabsState)
          .getValue();

        const newTabId = `tab-${uuidv4()}`;
        const newTab: PageLayoutTab = {
          id: newTabId,
          title: title || `Tab ${pageLayoutTabs.length + 1}`,
          position: pageLayoutTabs.length,
          pageLayoutId: '',
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        const updatedTabs = [...pageLayoutTabs, newTab];
        set(pageLayoutTabsState, updatedTabs);

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
