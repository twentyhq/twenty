import { useCallback } from 'react';

import { MAX_PRERENDERED_PAGE_LAYOUT_TABS } from '@/page-layout/constants/MaxPrerenderedPageLayoutTabs';
import { pageLayoutPrerenderedTabIdsComponentState } from '@/page-layout/states/pageLayoutPrerenderedTabIdsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const usePrerenderPageLayoutTab = () => {
  const setPageLayoutPrerenderedTabIds = useSetAtomComponentState(
    pageLayoutPrerenderedTabIdsComponentState,
  );

  const prerenderPageLayoutTab = useCallback(
    (tabId: string) => {
      setPageLayoutPrerenderedTabIds((currentTabIds) => {
        if (currentTabIds.at(-1) === tabId) {
          return currentTabIds;
        }

        return [...currentTabIds.filter((id) => id !== tabId), tabId].slice(
          -MAX_PRERENDERED_PAGE_LAYOUT_TABS,
        );
      });
    },
    [setPageLayoutPrerenderedTabIds],
  );

  return { prerenderPageLayoutTab };
};
