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

// The main surface hosts its route context store once, above the page
// transition, in MainAppLayoutWithSidePanel: the transition keeps the page
// being left mounted while the next one enters, and a provider inside each
// page would leave two of them writing the same store from different routes.
// The side panel renders its routes against its own location, which only the
// routed tree can read, and it remounts per location, so its provider lives
// inside the tree.
export const getWorkspaceRouteObjectsForSurface = (
  routeObjects: WorkspaceRouteObject[],
  surface: WorkspaceSurfaceType,
) => getWorkspaceRouteObjects(routeObjects, surface, surface === 'side-panel');
