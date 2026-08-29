import { Suspense, useCallback, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SidePanelRoutedPagePermissionGuard } from '@/side-panel/routing/components/SidePanelRoutedPagePermissionGuard';
import { SidePanelRoutedPageUnavailable } from '@/side-panel/routing/components/SidePanelRoutedPageUnavailable';
import { SIDE_PANEL_HOSTABLE_ROUTES } from '@/side-panel/routing/constants/SidePanelHostableRoutes';
import { SidePanelRoutedSurfaceContext } from '@/side-panel/routing/contexts/SidePanelRoutedSurfaceContext';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';
import { toSidePanelLocation } from '@/side-panel/routing/utils/toSidePanelLocation';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// A second outlet. The panel renders the same route elements as the main one
// against a location it owns, so a hosted page reads its params from the path
// it was opened with rather than from the browser URL.
export const SidePanelRoutedPage = () => {
  const sidePanelRoutedPagePath = useAtomComponentStateValue(
    sidePanelRoutedPagePathComponentState,
  );
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const navigate = useNavigate();

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

  if (!isDefined(location)) {
    return <SidePanelRoutedPageUnavailable />;
  }

  return (
    <SidePanelRoutedSurfaceContext.Provider value={surfaceValue}>
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
                  {hostableRoute.element}
                </SidePanelRoutedPagePermissionGuard>
              }
            />
          ))}
          <Route path="*" element={<SidePanelRoutedPageUnavailable />} />
        </Routes>
      </Suspense>
    </SidePanelRoutedSurfaceContext.Provider>
  );
};
