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
    (routeHandle?.workspaceSurfaces.includes(surface) ?? surface === 'main')
  );
};

export const isWorkspaceLocationExpandableFromSidePanel = (
  routeObjects: WorkspaceRouteObject[],
  location: Partial<Location> | string,
) => {
  if (
    !isWorkspaceLocationAvailableOnSurface(routeObjects, 'side-panel', location)
  ) {
    return false;
  }

  const canonicalMatch = matchRoutes(routeObjects, location)?.at(-1);
  const expandable =
    canonicalMatch?.route.handle?.isLocationExpandableFromSidePanel;

  return typeof expandable === 'function'
    ? expandable({ location })
    : (expandable ?? false);
};
