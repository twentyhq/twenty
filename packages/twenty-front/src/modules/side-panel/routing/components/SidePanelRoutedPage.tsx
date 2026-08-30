import { Suspense, useCallback, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SidePanelRoutedPagePermissionGuard } from '@/side-panel/routing/components/SidePanelRoutedPagePermissionGuard';
import { SidePanelRoutedPageUnavailable } from '@/side-panel/routing/components/SidePanelRoutedPageUnavailable';
import { SIDE_PANEL_HOSTABLE_ROUTES } from '@/side-panel/routing/constants/SidePanelHostableRoutes';
import { SidePanelRoutedSurfaceContext } from '@/side-panel/routing/contexts/SidePanelRoutedSurfaceContext';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';
import { toSidePanelLocation } from '@/side-panel/routing/utils/toSidePanelLocation';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const SidePanelRoutedPage = () => {
  const sidePanelRoutedPagePath = useAtomComponentStateValue(
    sidePanelRoutedPagePathComponentState,
  );
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
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

  const surfaceValue = useMemo(
    () => ({ navigateFromSidePanel }),
    [navigateFromSidePanel],
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
    <SidePanelRoutedSurfaceContext.Provider value={surfaceValue}>
      <ContextStoreComponentInstanceContext.Provider value={contextStoreValue}>
        <Suspense fallback={<SettingsSkeletonLoader />}>
          <Routes location={location}>
            {SIDE_PANEL_HOSTABLE_ROUTES.map((hostableRoute) => (
              <Route
                key={hostableRoute.path}
                path={hostableRoute.path}
                element={
                  <SidePanelRoutedPagePermissionGuard
                    settingsPermission={hostableRoute.settingsPermission}
                  >
                    {/* Inside the matched route, so it reads the panel's own
                        location rather than the browser's and fills this
                        surface's context store from it. */}
                    <RouteContextStoreProvider />
                    {hostableRoute.element}
                  </SidePanelRoutedPagePermissionGuard>
                }
              />
            ))}
            <Route path="*" element={<SidePanelRoutedPageUnavailable />} />
          </Routes>
        </Suspense>
      </ContextStoreComponentInstanceContext.Provider>
    </SidePanelRoutedSurfaceContext.Provider>
  );
};
