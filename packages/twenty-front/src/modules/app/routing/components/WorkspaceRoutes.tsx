import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { type WorkspaceSurfaceType } from '@/app/routing/types/WorkspaceRouteObject';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { isWorkspaceLocationAvailableOnSurface } from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type ReactNode } from 'react';
import { type Location, useRoutes } from 'react-router-dom';

export const WorkspaceRoutes = ({
  surface,
  location,
  fallback = null,
}: {
  surface: WorkspaceSurfaceType;
  location?: Partial<Location> | string;
  fallback?: ReactNode;
}) => {
  const routeObjects = useWorkspaceRouteObjects();
  const workspaceSurface = useWorkspaceSurface();

  const surfaceRouteObjects = getWorkspaceRouteObjectsForSurface(
    routeObjects,
    surface,
  );

  const routedElement = useRoutes(surfaceRouteObjects, location);
  const isLocationAvailable =
    location === undefined ||
    isWorkspaceLocationAvailableOnSurface(routeObjects, surface, location);

  return (
    <RoutedFlowStateScopeContext.Provider
      value={workspaceSurface.routedFlowStateScopeId ?? null}
    >
      {isLocationAvailable ? (routedElement ?? fallback) : fallback}
    </RoutedFlowStateScopeContext.Provider>
  );
};
