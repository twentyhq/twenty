import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SIDE_PANEL_PATH_SEARCH_PARAM } from '@/side-panel/routing/constants/SidePanelPathSearchParam';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';

// What the panel hosts rides in the URL, so a conversation and what sits
// beside it can be shared and survive a reload.
export const SidePanelPathUrlSyncEffect = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRoutedPath = useCurrentSidePanelRoutedPath();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (hasRestoredRef.current) {
      return;
    }

    hasRestoredRef.current = true;

    const pathToRestore = searchParams.get(SIDE_PANEL_PATH_SEARCH_PARAM);

    if (isDefined(pathToRestore) && isSidePanelHostablePath(pathToRestore)) {
      openRoutedPageInSidePanel({ path: pathToRestore });
    }
  }, [searchParams, openRoutedPageInSidePanel]);

  useEffect(() => {
    if (!hasRestoredRef.current) {
      return;
    }

    const pathInUrl = searchParams.get(SIDE_PANEL_PATH_SEARCH_PARAM);

    if (pathInUrl === currentRoutedPath) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    if (isDefined(currentRoutedPath)) {
      nextSearchParams.set(SIDE_PANEL_PATH_SEARCH_PARAM, currentRoutedPath);
    } else {
      nextSearchParams.delete(SIDE_PANEL_PATH_SEARCH_PARAM);
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [currentRoutedPath, searchParams, setSearchParams]);

  return null;
};
