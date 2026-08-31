import {
  type WorkspaceRouteObject,
  type WorkspaceSurfaceType,
} from '@/app/routing/types/WorkspaceRouteObject';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';
import { createElement, type ReactElement } from 'react';
import { Route } from 'react-router-dom';

const getWorkspaceRouteElements = (
  routeObjects: WorkspaceRouteObject[],
  shouldProvideRouteContextStore: boolean,
): ReactElement[] =>
  routeObjects.map((routeObject, routeIndex) => {
    const { children, element, ...routeProps } = routeObject;

    return createElement(
      Route,
      {
        ...routeProps,
        key: routeObject.id ?? routeObject.path ?? routeIndex,
        element: shouldProvideRouteContextStore ? (
          <>
            <RouteContextStoreProvider />
            {element}
          </>
        ) : (
          element
        ),
      },
      children ? getWorkspaceRouteElements(children, false) : null,
    );
  });

export const getWorkspaceRouteElementsForSurface = (
  routeObjects: WorkspaceRouteObject[],
  surface: WorkspaceSurfaceType,
) =>
  getWorkspaceRouteElements(
    getWorkspaceRouteObjectsForSurface(routeObjects, surface),
    true,
  );
