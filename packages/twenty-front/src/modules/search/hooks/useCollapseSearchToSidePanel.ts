import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useSearchPageQueryParams } from '@/search/hooks/useSearchPageQueryParams';
import { searchSidePanelHandoffPathnameState } from '@/search/states/searchSidePanelHandoffPathnameState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { getExpandedPageReturnLocation } from '~/utils/getExpandedPageReturnLocation';

export const useCollapseSearchToSidePanel = () => {
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { searchInput, objectNameSingular } = useSearchPageQueryParams();

  const returnLocation = getExpandedPageReturnLocation(location.state);

  return useCallback(() => {
    const destination = returnLocation ?? defaultHomePagePath;

    store.set(sidePanelSearchState.atom, searchInput);
    store.set(sidePanelSearchObjectFilterState.atom, objectNameSingular);
    store.set(
      searchSidePanelHandoffPathnameState.atom,
      destination.split('?')[0].split('#')[0],
    );

    navigate(destination);
  }, [
    store,
    searchInput,
    objectNameSingular,
    navigate,
    returnLocation,
    defaultHomePagePath,
  ]);
};
