import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';

import { searchSidePanelHandoffPathnameState } from '@/search/states/searchSidePanelHandoffPathnameState';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';

// Collapsing the search page navigates away, and leaving a route otherwise
// closes the side panel. Reopening from a layout effect lands before
// PageChangeEffect, which reads the same pathname to skip that close.
export const SidePanelSearchHandoffEffect = () => {
  const store = useStore();
  const { pathname } = useLocation();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();

  useLayoutEffect(() => {
    if (store.get(searchSidePanelHandoffPathnameState.atom) !== pathname) {
      return;
    }

    const isSearchAlreadyOpened =
      store.get(isSidePanelOpenedState.atom) &&
      store.get(sidePanelPageState.atom) === SidePanelPages.SearchRecords;

    if (isSearchAlreadyOpened) {
      return;
    }

    openRecordsSearchPage();
  }, [pathname, store, openRecordsSearchPage]);

  return null;
};
