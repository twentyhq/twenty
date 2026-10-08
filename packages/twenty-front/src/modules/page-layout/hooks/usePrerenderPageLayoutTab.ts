import { useCallback } from 'react';

import { pageLayoutPrerenderedTabIdsComponentState } from '@/page-layout/states/pageLayoutPrerenderedTabIdsComponentState';
import { computeNextPrerenderedTabIds } from '@/page-layout/utils/computeNextPrerenderedTabIds';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const usePrerenderPageLayoutTab = () => {
  const setPageLayoutPrerenderedTabIds = useSetAtomComponentState(
    pageLayoutPrerenderedTabIdsComponentState,
  );

  const prerenderPageLayoutTab = useCallback(
    (tabId: string) => {
      setPageLayoutPrerenderedTabIds((currentTabIds) =>
        computeNextPrerenderedTabIds({ currentTabIds, tabId }),
      );
    },
    [setPageLayoutPrerenderedTabIds],
  );

  return { prerenderPageLayoutTab };
};
