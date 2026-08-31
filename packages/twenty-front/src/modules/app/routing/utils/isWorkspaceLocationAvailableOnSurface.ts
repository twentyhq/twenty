import {
  type WorkspaceRouteObject,
  type WorkspaceSurfaceType,
} from '@/app/routing/types/WorkspaceRouteObject';
import { type Location, matchRoutes } from 'react-router-dom';

export const isWorkspaceLocationAvailableOnSurface = (
  routeObjects: WorkspaceRouteObject[],
  surface: WorkspaceSurfaceType,
  location: Partial<Location> | string,
) => {
  const canonicalMatch = matchRoutes(routeObjects, location)?.at(-1);
  const routeHandle = canonicalMatch?.route.handle;

  return (
    canonicalMatch !== undefined &&
    (routeHandle?.workspaceSurfaces.includes(surface) ?? surface === 'main') &&
    (routeHandle?.isLocationAvailableOnSurface?.({ surface, location }) ?? true)
  );
};

export const isWorkspaceLocationExpandableFromSidePanel = (
  routeObjects: WorkspaceRouteObject[],
  location: Partial<Location> | string,
) => {
  const canonicalMatch = matchRoutes(routeObjects, location)?.at(-1);
  const routeHandle = canonicalMatch?.route.handle;

  return (
    routeHandle?.workspaceSurfaces.includes('side-panel') === true &&
    (routeHandle.isLocationAvailableOnSurface?.({
      surface: 'side-panel',
      location,
    }) ??
      true) &&
    (routeHandle.isLocationExpandableFromSidePanel?.({ location }) ?? false)
  );
};
