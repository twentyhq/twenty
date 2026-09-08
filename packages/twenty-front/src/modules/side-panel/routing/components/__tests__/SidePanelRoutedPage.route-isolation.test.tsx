import { render, screen } from '@testing-library/react';
import { type FallbackProps } from 'react-error-boundary';
import {
  MemoryRouter,
  Outlet,
  useLocation,
  useParams,
  useRoutes,
} from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { SidePanelRoutedPage } from '@/side-panel/routing/components/SidePanelRoutedPage';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';

const companyRecordPath = getAppPath(AppPath.RecordShowPage, {
  objectNameSingular: 'company',
  objectRecordId: 'company-1',
});

const panelLocation = {
  pathname: companyRecordPath,
  search: '',
  hash: '',
  state: null,
  key: 'panel-company-1',
};

jest.mock('@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath', () => ({
  useCurrentSidePanelRoutedLocation: () => panelLocation,
}));

jest.mock(
  '@/side-panel/routing/components/SidePanelRouteNavigatorProvider',
  () => ({
    SidePanelRouteNavigatorProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
  }),
);

jest.mock('@/context-store/components/RouteContextStoreProvider', () => ({
  RouteContextStoreProvider: () => null,
}));

jest.mock('@/error-handler/components/AppErrorBoundary', () => {
  const { ErrorBoundary: MockErrorBoundary } = jest.requireActual(
    'react-error-boundary',
  );

  return {
    AppErrorBoundary: ({
      children,
      FallbackComponent,
    }: {
      children: React.ReactNode;
      FallbackComponent: React.ComponentType<FallbackProps>;
    }) => (
      <MockErrorBoundary FallbackComponent={FallbackComponent}>
        {children}
      </MockErrorBoundary>
    ),
  };
});

const PanelRecordProbe = () => {
  const { pathname } = useLocation();
  const params = useParams();

  return (
    <>
      <output aria-label="Panel path">{pathname}</output>
      <output aria-label="Panel object plural">
        {params.objectNamePlural ?? ''}
      </output>
      <output aria-label="Panel object singular">
        {params.objectNameSingular ?? ''}
      </output>
    </>
  );
};

const routeObjects: WorkspaceRouteObject[] = [
  {
    path: AppPath.RecordIndexPage,
    element: <div>panel index</div>,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
  {
    path: AppPath.RecordShowPage,
    element: <PanelRecordProbe />,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
];

const MainLayoutWithSidePanel = () => {
  const layout = useRoutes([
    {
      element: (
        <>
          <Outlet />
          <WorkspaceSurfaceContext.Provider
            value={{
              type: 'side-panel',
              instanceId: 'panel-page-1',
              ownsRouteLocation: false,
            }}
          >
            <SidePanelPageComponentInstanceContext.Provider
              value={{ instanceId: 'panel-page-1' }}
            >
              <SidePanelRoutedPage />
            </SidePanelPageComponentInstanceContext.Provider>
          </WorkspaceSurfaceContext.Provider>
        </>
      ),
      children: [
        {
          path: AppPath.RecordIndexPage,
          element: <div>main people index</div>,
        },
      ],
    },
  ]);

  return layout;
};

describe('SidePanelRoutedPage route isolation', () => {
  it('keeps panel record params off the main People index after a company hop', () => {
    render(
      <MemoryRouter initialEntries={['/objects/people']}>
        <WorkspaceRouteObjectsContext.Provider value={routeObjects}>
          <MainLayoutWithSidePanel />
        </WorkspaceRouteObjectsContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText('main people index')).toBeInTheDocument();
    expect(screen.getByLabelText('Panel path')).toHaveTextContent(
      companyRecordPath,
    );
    expect(screen.getByLabelText('Panel object singular')).toHaveTextContent(
      'company',
    );
    expect(screen.getByLabelText('Panel object plural').textContent).toBe('');
  });
});
