import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { SEARCH_PAGE_OBJECT_QUERY_PARAM } from '@/search/constants/SearchPageObjectQueryParam';
import { SEARCH_PAGE_QUERY_PARAM } from '@/search/constants/SearchPageQueryParam';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useExpandSearchToPage = () => {
  const store = useStore();
  const location = useLocation();
  const navigateApp = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const expandSearchToPage = useCallback(() => {
    const searchInput = store.get(sidePanelSearchState.atom);
    const objectNameSingular = store.get(sidePanelSearchObjectFilterState.atom);

    void closeSidePanelMenu();

    navigateApp(
      AppPath.Search,
      undefined,
      {
        [SEARCH_PAGE_QUERY_PARAM]: searchInput.trim() || undefined,
        [SEARCH_PAGE_OBJECT_QUERY_PARAM]: objectNameSingular ?? undefined,
      },
      {
        state: {
          returnLocation: `${location.pathname}${location.search}${location.hash}`,
        },
      },
    );
  }, [store, closeSidePanelMenu, navigateApp, location]);

  return { expandSearchToPage };
};
