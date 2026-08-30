import { styled } from '@linaria/react';
import { Suspense, useCallback, useMemo, type MouseEvent } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { SidePanelRoutedPageUnavailable } from '@/side-panel/routing/components/SidePanelRoutedPageUnavailable';
import { SIDE_PANEL_HOSTABLE_ROUTES } from '@/side-panel/routing/constants/SidePanelHostableRoutes';
import { SidePanelRoutedSurfaceContext } from '@/side-panel/routing/contexts/SidePanelRoutedSurfaceContext';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';
import { toSidePanelLocation } from '@/side-panel/routing/utils/toSidePanelLocation';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { IsInSidePanelRoutedSurfaceContext } from '@/ui/layout/side-panel/contexts/IsInSidePanelRoutedSurfaceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// The hosted page lays itself out as if it owned the outlet, so this boundary
// must not become a box in the middle of that.
const StyledClickBoundary = styled.div`
  display: contents;
`;

export const SidePanelRoutedPage = () => {
  const sidePanelRoutedPagePath = useAtomComponentStateValue(
    sidePanelRoutedPagePathComponentState,
  );
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const { goBackFromSidePanel } = useSidePanelHistory();
  const navigate = useNavigate();

  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const navigateFromSidePanel = useCallback(
    (nextPath: string) => {
      if (isSidePanelHostablePath(nextPath)) {
        openRoutedPageInSidePanel({ path: nextPath });
        return;
      }

      navigate(nextPath);
    },
    [openRoutedPageInSidePanel, navigate],
  );

  // A react-router Link renders an anchor bound to the browser router, which
  // the panel's Routes overrides the location of but not the navigator, so a
  // link to a hostable target would move the main outlet and PageChangeEffect
  // would close the panel with it. Stopping the event here rather than only
  // preventing its default also keeps a row that pairs a link with its own
  // panel-aware handler from opening the same page twice.
  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.('a');

      if (
        !isDefined(anchor) ||
        (anchor.target !== '' && anchor.target !== '_self')
      ) {
        return;
      }

      const href = anchor.getAttribute('href');

      if (
        !isDefined(href) ||
        !href.startsWith('/') ||
        !isSidePanelHostablePath(href)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      openRoutedPageInSidePanel({ path: href });
    },
    [openRoutedPageInSidePanel],
  );

  const surfaceValue = useMemo(
    () => ({ navigateFromSidePanel, goBackFromSidePanel }),
    [navigateFromSidePanel, goBackFromSidePanel],
  );

  const location = useMemo(
    () =>
      isDefined(sidePanelRoutedPagePath)
        ? toSidePanelLocation(sidePanelRoutedPagePath)
        : null,
    [sidePanelRoutedPagePath],
  );

  const contextStoreValue = useMemo(
    () => ({ instanceId: sidePanelPageInstanceId ?? '' }),
    [sidePanelPageInstanceId],
  );

  if (!isDefined(location) || !isDefined(sidePanelPageInstanceId)) {
    return <SidePanelRoutedPageUnavailable />;
  }

  return (
    <IsInSidePanelRoutedSurfaceContext.Provider value={true}>
      <SidePanelRoutedSurfaceContext.Provider value={surfaceValue}>
        <ContextStoreComponentInstanceContext.Provider
          value={contextStoreValue}
        >
          <StyledClickBoundary onClickCapture={handleClickCapture}>
            <Suspense fallback={<SettingsSkeletonLoader />}>
              <Routes location={location}>
                {SIDE_PANEL_HOSTABLE_ROUTES.map((hostableRoute) => (
                  <Route
                    key={hostableRoute.path}
                    path={hostableRoute.path}
                    element={
                      <SettingsProtectedRouteWrapper
                        settingsPermission={hostableRoute.settingsPermission}
                        requiredFeatureFlag={hostableRoute.requiredFeatureFlag}
                        fallback={<SidePanelRoutedPageUnavailable />}
                      >
                        {/* Inside the matched route, so it reads the panel's own
                        location rather than the browser's and fills this
                        surface's context store from it. */}
                        <RouteContextStoreProvider />
                        {hostableRoute.element}
                      </SettingsProtectedRouteWrapper>
                    }
                  />
                ))}
                <Route path="*" element={<SidePanelRoutedPageUnavailable />} />
              </Routes>
            </Suspense>
          </StyledClickBoundary>
        </ContextStoreComponentInstanceContext.Provider>
      </SidePanelRoutedSurfaceContext.Provider>
    </IsInSidePanelRoutedSurfaceContext.Provider>
  );
};
