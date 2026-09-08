import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Outlet, useRoutes } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';

jest.mock('@/navigation/hooks/useLastVisitedView', () => ({
  useLastVisitedView: () => ({
    getLastVisitedViewIdFromObjectNamePlural: () => undefined,
  }),
}));

jest.mock('@/object-metadata/states/objectMetadataItemsSelector', () => ({
  objectMetadataItemsSelector: { key: 'object-metadata-items' },
}));

jest.mock('@/views/states/selectors/viewsSelector', () => ({
  viewsSelector: { key: 'views' },
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: ({ key }: { key: string }) =>
    key === 'object-metadata-items'
      ? [
          {
            id: 'company-object',
            namePlural: 'companies',
            nameSingular: 'company',
          },
          {
            id: 'person-object',
            namePlural: 'people',
            nameSingular: 'person',
          },
          {
            id: 'new-object',
            namePlural: 'new',
            nameSingular: 'new',
          },
        ]
      : [
          {
            id: 'company-view',
            objectMetadataId: 'company-object',
            type: 'TABLE',
          },
          {
            id: 'company-index-view',
            objectMetadataId: 'company-object',
            type: 'TABLE',
            key: 'INDEX',
          },
          {
            id: 'person-view',
            objectMetadataId: 'person-object',
            type: 'TABLE',
          },
        ],
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => ({ status: 'up-to-date' }),
}));

jest.mock('@/context-store/components/RouteContextStoreProviderEffect', () => ({
  RouteContextStoreProviderEffect: ({
    viewId,
    objectMetadataItem,
  }: {
    viewId?: string;
    objectMetadataItem?: { id: string };
  }) => (
    <div
      data-testid="route-context-store"
      data-view-id={viewId}
      data-object-metadata-id={objectMetadataItem?.id}
    />
  ),
}));

const MAIN_AND_SIDE_PANEL = ['main', 'side-panel'] as const;

const routeObjects: WorkspaceRouteObject[] = [
  {
    path: AppPath.RecordIndexPage,
    element: null,
    handle: { workspaceSurfaces: MAIN_AND_SIDE_PANEL },
  },
  {
    path: AppPath.RecordShowPage,
    element: null,
    handle: { workspaceSurfaces: MAIN_AND_SIDE_PANEL },
  },
  {
    path: `/${AppPath.Settings}`,
    element: <Outlet />,
    children: [
      { path: SettingsPath.NewObject, element: null },
      { path: SettingsPath.ObjectNewFieldSelect, element: null },
    ],
  },
];

const mainSurfaceRouteObjects = getWorkspaceRouteObjectsForSurface(
  routeObjects,
  'main',
);

const sidePanelRouteObjects = getWorkspaceRouteObjectsForSurface(
  routeObjects,
  'side-panel',
);

const MainSurfaceLayout = () => (
  <>
    <RouteContextStoreProvider />
    <Outlet />
  </>
);

const MainSurfaceRoutes = () =>
  useRoutes([
    { element: <MainSurfaceLayout />, children: mainSurfaceRouteObjects },
  ]);

const SidePanelHostLayout = () => (
  <>
    <Outlet />
    {useRoutes(sidePanelRouteObjects, '/object/person/record-1')}
  </>
);

const SidePanelHostRoutes = () =>
  useRoutes([
    { element: <SidePanelHostLayout />, children: mainSurfaceRouteObjects },
  ]);

const renderAt = (initialEntry: string, children: ReactNode) =>
  render(
    <WorkspaceRouteObjectsContext.Provider value={routeObjects}>
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    </WorkspaceRouteObjectsContext.Provider>,
  );

describe('RouteContextStoreProvider', () => {
  it('accepts a query-param view owned by the route object', () => {
    renderAt('/objects/companies?viewId=company-view', <MainSurfaceRoutes />);

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-view-id',
      'company-view',
    );
  });

  it('falls back when the query-param view belongs to another object', () => {
    renderAt('/objects/companies?viewId=person-view', <MainSurfaceRoutes />);

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-view-id',
      'company-index-view',
    );
  });

  it('resolves the object on settings object pages', () => {
    renderAt(
      '/settings/objects/companies/new-field/select',
      <MainSurfaceRoutes />,
    );

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-object-metadata-id',
      'company-object',
    );
  });

  it('does not read a static settings segment as an object name', () => {
    renderAt('/settings/objects/new', <MainSurfaceRoutes />);

    expect(screen.getByTestId('route-context-store')).not.toHaveAttribute(
      'data-object-metadata-id',
    );
  });

  it('resolves the side panel object from the panel location rather than the main surface route params', () => {
    renderAt('/objects/companies', <SidePanelHostRoutes />);

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-object-metadata-id',
      'person-object',
    );
  });
});
