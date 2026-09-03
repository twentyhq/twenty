import {
  type WorkspaceRouteObject,
  type WorkspaceSurfaceType,
} from '@/app/routing/types/WorkspaceRouteObject';
import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';

const getWorkspaceRouteObjects = (
  routeObjects: WorkspaceRouteObject[],
  surface: WorkspaceSurfaceType,
  shouldProvideRouteContextStore: boolean,
): WorkspaceRouteObject[] =>
  routeObjects.flatMap((routeObject) => {
    const isStructuralRoute = routeObject.children !== undefined;
    const isAvailableOnSurface =
      routeObject.handle?.workspaceSurfaces.includes(surface) ??
      (isStructuralRoute || surface === 'main');

    if (!isAvailableOnSurface) {
      return [];
    }

    const children = isStructuralRoute
      ? getWorkspaceRouteObjects(routeObject.children ?? [], surface, false)
      : undefined;

    if (isStructuralRoute && children?.length === 0) {
      return [];
    }

    return [
      {
        ...routeObject,
        element: shouldProvideRouteContextStore ? (
          <>
            <RouteContextStoreProvider />
            {routeObject.element}
          </>
        ) : (
          routeObject.element
        ),
        children,
      },
    ];
  });

export const getWorkspaceRouteObjectsForSurface = (
  routeObjects: WorkspaceRouteObject[],
  surface: WorkspaceSurfaceType,
) => getWorkspaceRouteObjects(routeObjects, surface, true);
