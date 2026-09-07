/* oxlint-disable twenty/no-navigate-prefer-link */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useState } from 'react';
import {
  Link,
  MemoryRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AppPath, SettingsPath, SidePanelPages } from 'twenty-shared/types';
import { IconSettings } from 'twenty-ui/icon';

import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { SidePanelRouteNavigatorProvider } from '@/side-panel/routing/components/SidePanelRouteNavigatorProvider';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const openRoutedPageInSidePanelMock = jest.fn();
const closeSidePanelMenuMock = jest.fn();
const goBackFromSidePanelMock = jest.fn();
const navigateSidePanelHistoryMock = jest.fn();
const openSettingsMenuMock = jest.fn();

jest.mock('@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel', () => ({
  useOpenRoutedPageInSidePanel: () => ({
    openRoutedPageInSidePanel: openRoutedPageInSidePanelMock,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: closeSidePanelMenuMock,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({
    goBackFromSidePanel: goBackFromSidePanelMock,
    navigateSidePanelHistory: navigateSidePanelHistoryMock,
  }),
}));

jest.mock('@/navigation/hooks/useOpenSettings', () => ({
  useOpenSettingsMenu: () => ({ openSettingsMenu: openSettingsMenuMock }),
}));

const routeObjects: WorkspaceRouteObject[] = [
  {
    path: '/settings/*',
    element: null,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
  {
    path: AppPath.RecordShowPage,
    element: null,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
  {
    path: AppPath.Home,
    element: null,
    handle: { workspaceSurfaces: ['main'] },
  },
];

const ParentLocation = () => {
  const location = useLocation();

  return (
    <div data-testid="parent-location">
      {`${location.pathname}${location.search}${location.hash}`}
    </div>
  );
};

const PanelNavigationProbe = () => {
  const navigate = useNavigate();
  const navigateApp = useNavigateApp();
  const navigateSettings = useNavigateSettings();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  return (
    <>
      <Link to="../roles/role-1">role</Link>
      <button onClick={() => navigate('#roles')}>hash</button>
      <button onClick={() => navigate('?tab=roles')}>search</button>
      <button onClick={() => setShouldRedirect(true)}>redirect</button>
      <button onClick={() => navigate('/home?from=panel#top')}>
        unsupported
      </button>
      <button
        onClick={() =>
          navigateApp(
            AppPath.RecordShowPage,
            {
              objectNameSingular: 'company',
              objectRecordId: 'record-1',
            },
            undefined,
            { surface: 'main' },
          )
        }
      >
        main
      </button>
      <button
        onClick={() =>
          navigateSettings(SettingsPath.NewAccount, undefined, undefined, {
            surface: 'main',
          })
        }
      >
        main settings
      </button>
      <button onClick={() => navigate(-1)}>back</button>
      {shouldRedirect && (
        <Navigate
          to="../roles/role-2?source=redirect"
          replace
          state={{ origin: 'members' }}
        />
      )}
    </>
  );
};

const renderNavigationProbe = () => {
  const store = createStore();

  store.set(sidePanelNavigationStackState.atom, [
    {
      page: SidePanelPages.RoutedPage,
      pageTitle: 'Members',
      pageIcon: IconSettings,
      pageId: 'panel-page-1',
      routedFlowStateScopeId: 'settings-flow-1',
      routedLocation: {
        pathname: '/settings/members',
        search: '?sort=name',
        hash: '#people',
        state: null,
        key: 'side-panel-location',
      },
    },
  ]);

  return render(
    <JotaiProvider store={store}>
      <MemoryRouter initialEntries={['/chat?thread=thread-1']}>
        <WorkspaceRouteObjectsContext.Provider value={routeObjects}>
          <Routes
            location={{
              pathname: '/settings/members',
              search: '?sort=name',
              hash: '#people',
              state: null,
              key: 'side-panel-location',
            }}
          >
            <Route
              path="/settings/*"
              element={
                <WorkspaceSurfaceContext.Provider
                  value={{
                    type: 'side-panel',
                    instanceId: 'panel-page-1',
                    ownsRouteLocation: true,
                  }}
                >
                  <SidePanelRouteNavigatorProvider>
                    <Routes>
                      <Route
                        path="members"
                        element={<PanelNavigationProbe />}
                      />
                    </Routes>
                  </SidePanelRouteNavigatorProvider>
                </WorkspaceSurfaceContext.Provider>
              }
            />
          </Routes>
          <ParentLocation />
        </WorkspaceRouteObjectsContext.Provider>
      </MemoryRouter>
    </JotaiProvider>,
  );
};

describe('SidePanelRouteNavigatorProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps Link navigation in the panel and exposes a canonical href', () => {
    renderNavigationProbe();

    const link = screen.getByRole('link', { name: 'role' });

    expect(link).toHaveAttribute('href', '/settings/roles/role-1');

    fireEvent.click(link);

    expect(openRoutedPageInSidePanelMock).toHaveBeenCalledWith({
      path: '/settings/roles/role-1',
      state: undefined,
      replaceCurrent: false,
      routedFlowStateScopeId: 'settings-flow-1',
    });
    expect(screen.getByTestId('parent-location')).toHaveTextContent(
      '/chat?thread=thread-1',
    );
  });

  it('leaves modified Link clicks to the canonical browser href', () => {
    renderNavigationProbe();

    const link = screen.getByRole('link', { name: 'role' });

    link.addEventListener('click', (event) => event.preventDefault());

    fireEvent.click(link, {
      metaKey: true,
    });

    expect(openRoutedPageInSidePanelMock).not.toHaveBeenCalled();
  });

  it('resolves hash-only and search-only useNavigate calls from the panel location', () => {
    renderNavigationProbe();

    fireEvent.click(screen.getByRole('button', { name: 'hash' }));
    expect(openRoutedPageInSidePanelMock).toHaveBeenLastCalledWith({
      path: '/settings/members#roles',
      state: undefined,
      replaceCurrent: false,
      routedFlowStateScopeId: 'settings-flow-1',
    });

    fireEvent.click(screen.getByRole('button', { name: 'search' }));
    expect(openRoutedPageInSidePanelMock).toHaveBeenLastCalledWith({
      path: '/settings/members?tab=roles',
      state: undefined,
      replaceCurrent: false,
      routedFlowStateScopeId: 'settings-flow-1',
    });
  });

  it('uses replace semantics for Navigate', async () => {
    renderNavigationProbe();

    fireEvent.click(screen.getByRole('button', { name: 'redirect' }));

    await waitFor(() => {
      expect(openRoutedPageInSidePanelMock).toHaveBeenCalledWith({
        path: '/settings/roles/role-2?source=redirect',
        state: { origin: 'members' },
        replaceCurrent: true,
        routedFlowStateScopeId: 'settings-flow-1',
      });
    });
  });

  it('closes the panel and delegates unsupported routes to the main navigator', () => {
    renderNavigationProbe();

    fireEvent.click(screen.getByRole('button', { name: 'unsupported' }));

    expect(closeSidePanelMenuMock).toHaveBeenCalledTimes(1);
    expect(openRoutedPageInSidePanelMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('parent-location')).toHaveTextContent(
      '/home?from=panel#top',
    );
  });

  it('can explicitly move a panel-capable route to the main surface', () => {
    renderNavigationProbe();

    fireEvent.click(screen.getByRole('button', { name: 'main' }));

    expect(closeSidePanelMenuMock).toHaveBeenCalledTimes(1);
    expect(openRoutedPageInSidePanelMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('parent-location')).toHaveTextContent(
      '/object/company/record-1',
    );
  });

  it('opens the settings shell once when escaping settings to the main surface', () => {
    renderNavigationProbe();

    fireEvent.click(screen.getByRole('button', { name: 'main settings' }));

    expect(closeSidePanelMenuMock).toHaveBeenCalledTimes(1);
    expect(openSettingsMenuMock).toHaveBeenCalledTimes(1);
    expect(openRoutedPageInSidePanelMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('parent-location')).toHaveTextContent(
      '/settings/accounts/new',
    );
  });

  it('maps navigate(-1) to side-panel history', () => {
    renderNavigationProbe();

    fireEvent.click(screen.getByRole('button', { name: 'back' }));

    expect(goBackFromSidePanelMock).toHaveBeenCalledTimes(1);
  });
});
