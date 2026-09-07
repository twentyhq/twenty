import { useMemo } from 'react';
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
            <WorkspaceRoutes
              location={location}
              fallback={<WorkspaceRouteUnavailable />}
            />
          </SidePanelRouteNavigatorProvider>
        </AppErrorBoundary>
      </ContextStoreComponentInstanceContext.Provider>
    </WorkspaceSurfaceContext.Provider>
  );
};
