import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SIDE_PANEL_PATH_SEARCH_PARAM } from '@/side-panel/routing/constants/SidePanelPathSearchParam';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';

export const SidePanelPathUrlSyncEffect = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRoutedPath = useCurrentSidePanelRoutedPath();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    if (hasRestored) {
      return;
    }

    setHasRestored(true);

    const pathToRestore = searchParams.get(SIDE_PANEL_PATH_SEARCH_PARAM);

    if (isDefined(pathToRestore) && isSidePanelHostablePath(pathToRestore)) {
      openRoutedPageInSidePanel({ path: pathToRestore });
    }
  }, [hasRestored, searchParams, openRoutedPageInSidePanel]);

  useEffect(() => {
    // Writing before the restore has run would clear the very param it reads.
    if (!hasRestored) {
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
  }, [hasRestored, currentRoutedPath, searchParams, setSearchParams]);

  return null;
};
