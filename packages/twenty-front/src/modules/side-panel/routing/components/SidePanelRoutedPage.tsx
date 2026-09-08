import { useMemo } from 'react';
import { UNSAFE_RouteContext } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Trans } from '@lingui/react/macro';

import { WorkspaceRoutes } from '@/app/routing/components/WorkspaceRoutes';
import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { SidePanelRouteNavigatorProvider } from '@/side-panel/routing/components/SidePanelRouteNavigatorProvider';
import { useCurrentSidePanelRoutedLocation } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

// The panel is a sibling of the main Outlet. React Router shares one params
// object across that branch, so useRoutes(location) can match a Company record
// while useParams still carries objectNamePlural from the People index.
const SIDE_PANEL_ROUTE_CONTEXT = {
  outlet: null,
  matches: [],
  isDataRoute: false,
};

const SidePanelRouteErrorFallback = () => (
  <WorkspaceRouteUnavailable>
    <Trans>Something went wrong while loading this page.</Trans>
  </WorkspaceRouteUnavailable>
);

export const SidePanelRoutedPage = () => {
  const location = useCurrentSidePanelRoutedLocation();
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;
  const workspaceSurface = useWorkspaceSurface();

  const contextStoreValue = useMemo(
    () => ({ instanceId: sidePanelPageInstanceId ?? '' }),
    [sidePanelPageInstanceId],
  );
  const routedWorkspaceSurface = useMemo(
    () => ({ ...workspaceSurface, ownsRouteLocation: true }),
    [workspaceSurface],
  );

  if (!isDefined(location) || !isDefined(sidePanelPageInstanceId)) {
    return <WorkspaceRouteUnavailable />;
  }

  return (
    <WorkspaceSurfaceContext.Provider value={routedWorkspaceSurface}>
      <ContextStoreComponentInstanceContext.Provider value={contextStoreValue}>
        <AppErrorBoundary
          key={location.key}
          FallbackComponent={SidePanelRouteErrorFallback}
          resetOnLocationChange={false}
        >
          <SidePanelRouteNavigatorProvider>
            <UNSAFE_RouteContext.Provider value={SIDE_PANEL_ROUTE_CONTEXT}>
              <WorkspaceRoutes
                location={location}
                fallback={<WorkspaceRouteUnavailable />}
              />
            </UNSAFE_RouteContext.Provider>
          </SidePanelRouteNavigatorProvider>
        </AppErrorBoundary>
      </ContextStoreComponentInstanceContext.Provider>
    </WorkspaceSurfaceContext.Provider>
  );
};
