import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { isWorkspaceLocationAvailableOnSurface } from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type ReactNode, useMemo } from 'react';
import { type Location, useRoutes } from 'react-router-dom';

export const WorkspaceRoutes = ({
  location,
  fallback = null,
}: {
  location?: Partial<Location> | string;
  fallback?: ReactNode;
}) => {
  const routeObjects = useWorkspaceRouteObjects();
  const workspaceSurface = useWorkspaceSurface();

  const surfaceRouteObjects = useMemo(
    () =>
      getWorkspaceRouteObjectsForSurface(routeObjects, workspaceSurface.type),
    [routeObjects, workspaceSurface.type],
  );

  const routedElement = useRoutes(surfaceRouteObjects, location);
  const isLocationAvailable =
    location === undefined ||
    isWorkspaceLocationAvailableOnSurface(
      routeObjects,
      workspaceSurface.type,
      location,
    );

  return (
    <RoutedFlowStateScopeContext.Provider
      value={workspaceSurface.routedFlowStateScopeId ?? null}
    >
      {isLocationAvailable ? (routedElement ?? fallback) : fallback}
    </RoutedFlowStateScopeContext.Provider>
  );
};
