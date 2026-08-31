import {
  type WorkspaceRouteObject,
  type WorkspaceSurfaceType,
} from '@/app/routing/types/WorkspaceRouteObject';

export const getWorkspaceRouteObjectsForSurface = (
  routeObjects: WorkspaceRouteObject[],
  surface: WorkspaceSurfaceType,
): WorkspaceRouteObject[] =>
  routeObjects.flatMap((routeObject) => {
    const isStructuralRoute = routeObject.children !== undefined;
    const isAvailableOnSurface =
      routeObject.handle?.workspaceSurfaces.includes(surface) ??
      (isStructuralRoute || surface === 'main');

    if (!isAvailableOnSurface) {
      return [];
    }

    if (!isStructuralRoute) {
      return [routeObject];
    }

    const children = getWorkspaceRouteObjectsForSurface(
      routeObject.children ?? [],
      surface,
    );

    return children.length > 0 ? [{ ...routeObject, children }] : [];
  });
