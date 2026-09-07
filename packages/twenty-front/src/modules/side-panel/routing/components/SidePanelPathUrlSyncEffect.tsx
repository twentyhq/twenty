import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SIDE_PANEL_PATH_SEARCH_PARAM } from '@/side-panel/routing/constants/SidePanelPathSearchParam';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { isWorkspaceLocationAvailableOnSurface } from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { isSafeInternalPath } from '@/ui/navigation/utils/isSafeInternalPath';

export const SidePanelPathUrlSyncEffect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const currentRoutedPath = useCurrentSidePanelRoutedPath();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const routeObjects = useWorkspaceRouteObjects();

  const pathInUrl = searchParams.get(SIDE_PANEL_PATH_SEARCH_PARAM);
  // This is an effect-to-effect loop guard, not user-visible application state.
  // oxlint-disable-next-line twenty/no-state-useref
  const previousSyncStateRef = useRef<{
    pathInUrl: string | null;
    routedPath: string | null;
  } | null>(null);

  const replaceSearchParams = useCallback(
    (nextSearchParams: URLSearchParams) => {
      const serializedSearchParams = nextSearchParams.toString();

      navigate(
        {
          pathname: location.pathname,
          search:
            serializedSearchParams.length > 0
              ? `?${serializedSearchParams}`
              : '',
          hash: location.hash,
        },
        {
          replace: true,
          state: location.state,
          preventScrollReset: true,
        },
      );
    },
    [location.hash, location.pathname, location.state, navigate],
  );

  useEffect(() => {
    const previousSyncState = previousSyncStateRef.current;
    const pathInUrlChanged =
      previousSyncState === null || previousSyncState.pathInUrl !== pathInUrl;
    const routedPathChanged =
      previousSyncState === null ||
      previousSyncState.routedPath !== currentRoutedPath;

    previousSyncStateRef.current = {
      pathInUrl,
      routedPath: currentRoutedPath,
    };

    if (pathInUrlChanged) {
      const isValidPathInUrl =
        isDefined(pathInUrl) &&
        isSafeInternalPath(pathInUrl) &&
        isWorkspaceLocationAvailableOnSurface(
          routeObjects,
          'side-panel',
          pathInUrl,
        );

      if (isValidPathInUrl) {
        if (pathInUrl !== currentRoutedPath) {
          openRoutedPageInSidePanel({
            path: pathInUrl,
            // The URL is an external projection of the secondary location.
            // Selecting another projected artifact starts a fresh stack entry
            // and state flow; only in-panel replace navigation inherits them.
            resetNavigationStack: true,
          });
        }

        return;
      }

      if (isDefined(currentRoutedPath)) {
        void closeSidePanelMenu();
      }

      if (!isDefined(pathInUrl)) {
        return;
      }

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete(SIDE_PANEL_PATH_SEARCH_PARAM);
      replaceSearchParams(nextSearchParams);

      return;
    }

    if (!routedPathChanged || pathInUrl === currentRoutedPath) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    if (isDefined(currentRoutedPath)) {
      nextSearchParams.set(SIDE_PANEL_PATH_SEARCH_PARAM, currentRoutedPath);
    } else {
      nextSearchParams.delete(SIDE_PANEL_PATH_SEARCH_PARAM);
    }

    replaceSearchParams(nextSearchParams);
  }, [
    closeSidePanelMenu,
    currentRoutedPath,
    openRoutedPageInSidePanel,
    pathInUrl,
    replaceSearchParams,
    routeObjects,
    searchParams,
  ]);

  return null;
};
