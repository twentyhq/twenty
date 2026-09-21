import { Children, isValidElement, type ReactNode } from 'react';

import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';

const containsRouteContextStoreProvider = (node: ReactNode): boolean =>
  Children.toArray(node).some(
    (child) =>
      isValidElement(child) &&
      (child.type === RouteContextStoreProvider ||
        containsRouteContextStoreProvider(
          (child.props as { children?: ReactNode }).children,
        )),
  );

const routeObjects: WorkspaceRouteObject[] = [
  {
    path: '/objects/:objectNamePlural',
    element: <div>index</div>,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
  {
    path: '/settings/*',
    element: <div>settings</div>,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
];

describe('getWorkspaceRouteObjectsForSurface', () => {
  it('leaves main-surface route elements without a route context store provider', () => {
    const mainRouteObjects = getWorkspaceRouteObjectsForSurface(
      routeObjects,
      'main',
    );

    expect(mainRouteObjects).toHaveLength(2);
    expect(
      mainRouteObjects.some((routeObject) =>
        containsRouteContextStoreProvider(routeObject.element),
      ),
    ).toBe(false);
  });

  it('wraps side-panel route elements with a route context store provider', () => {
    const sidePanelRouteObjects = getWorkspaceRouteObjectsForSurface(
      routeObjects,
      'side-panel',
    );

    expect(sidePanelRouteObjects).toHaveLength(2);
    expect(
      sidePanelRouteObjects.every((routeObject) =>
        containsRouteContextStoreProvider(routeObject.element),
      ),
    ).toBe(true);
  });
});
