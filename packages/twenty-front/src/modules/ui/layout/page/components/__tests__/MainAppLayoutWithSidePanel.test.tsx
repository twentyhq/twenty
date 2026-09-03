import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import {
  MemoryRouter,
  type NavigateFunction,
  useNavigate,
  useRoutes,
} from 'react-router-dom';

import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { MainAppLayoutWithSidePanel } from '@/ui/layout/page/components/MainAppLayoutWithSidePanel';

const mockProviderStats = { current: 0, max: 0 };
const mockSeenParams: Record<string, string | undefined>[] = [];

jest.mock('@/context-store/components/RouteContextStoreProvider', () => {
  const { useParams } = jest.requireActual('react-router-dom');

  return {
    RouteContextStoreProvider: () => {
      mockSeenParams.push(useParams());

      useEffect(() => {
        mockProviderStats.current += 1;
        mockProviderStats.max = Math.max(
          mockProviderStats.max,
          mockProviderStats.current,
        );

        return () => {
          mockProviderStats.current -= 1;
        };
      }, []);

      return null;
    },
  };
});

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

const navigateRef: { current: NavigateFunction | null } = { current: null };

const NavigateProbeEffect = () => {
  navigateRef.current = useNavigate();

  return null;
};

const MainSurfaceRoutes = () =>
  useRoutes([
    {
      element: <MainAppLayoutWithSidePanel />,
      children: getWorkspaceRouteObjectsForSurface(routeObjects, 'main'),
    },
  ]);

describe('MainAppLayoutWithSidePanel', () => {
  it('hosts one route context store provider that reads the matched leaf params', async () => {
    render(
      <MemoryRouter initialEntries={['/objects/companies']}>
        <NavigateProbeEffect />
        <MainSurfaceRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByText('record index page')).toBeInTheDocument();
    // Hosted above the routes, the provider still reads the matched leaf's
    // params: react-router shares one params object across a matched branch.
    expect(mockSeenParams.at(-1)?.objectNamePlural).toBe('companies');

    act(() => {
      navigateRef.current?.('/settings/profile');
    });

    await waitFor(() => {
      expect(screen.getByText('settings page')).toBeInTheDocument();
    });

    expect(mockSeenParams.at(-1)?.objectNamePlural).toBeUndefined();
    expect(mockProviderStats.max).toBe(1);
  });
});
