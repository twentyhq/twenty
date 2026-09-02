import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { MainAppLayoutWithSidePanel } from '@/ui/layout/page/components/MainAppLayoutWithSidePanel';

const mountedProviders = { current: 0, max: 0 };

jest.mock('@/context-store/components/RouteContextStoreProvider', () => ({
  RouteContextStoreProvider: () => {
    useEffect(() => {
      mountedProviders.current += 1;
      mountedProviders.max = Math.max(
        mountedProviders.max,
        mountedProviders.current,
      );

      return () => {
        mountedProviders.current -= 1;
      };
    }, []);

    return null;
  },
}));

jest.mock('@/side-panel/components/SidePanelForDesktop', () => ({
  SidePanelForDesktop: () => null,
}));

jest.mock('@/command-menu/components/CommandMenuForMobile', () => ({
  CommandMenuForMobile: () => null,
}));

jest.mock('@/side-panel/routing/components/SidePanelPathUrlSyncEffect', () => ({
  SidePanelPathUrlSyncEffect: () => null,
}));

jest.mock('@/command-menu/hooks/useCommandMenuHotKeys', () => ({
  useCommandMenuHotKeys: () => {},
}));

const routeObjects: WorkspaceRouteObject[] = [
  {
    path: '/objects/:objectNamePlural',
    element: <div>record index page</div>,
    handle: { workspaceSurfaces: ['main'] },
  },
  {
    path: '/settings/*',
    element: <div>settings page</div>,
    handle: { workspaceSurfaces: ['main'] },
  },
];

describe('MainAppLayoutWithSidePanel', () => {
  // Switching between the app and settings sections keeps the page being left
  // mounted while the next one animates in. If each page carried its own route
  // context store provider, the stale one would keep writing the main store
  // from a route that no longer matches the location, fighting the new one.
  it('keeps a single route context store provider on the main surface across a section switch', async () => {
    const router = createMemoryRouter(
      [
        {
          element: <MainAppLayoutWithSidePanel />,
          children: getWorkspaceRouteObjectsForSurface(routeObjects, 'main'),
        },
      ],
      { initialEntries: ['/objects/companies'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('record index page')).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/settings/profile');
    });

    await waitFor(() => {
      expect(screen.getByText('settings page')).toBeInTheDocument();
    });

    expect(mountedProviders.max).toBe(1);
  });
});
