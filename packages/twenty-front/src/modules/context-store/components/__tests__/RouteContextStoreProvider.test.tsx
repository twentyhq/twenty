import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
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

const MainSurfaceLayout = () => (
  <>
    <RouteContextStoreProvider />
    <Outlet />
  </>
);

const renderOnMainSurface = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<MainSurfaceLayout />}>
          <Route path={AppPath.RecordIndexPage} element={null} />
          <Route path={AppPath.Settings}>
            <Route path={SettingsPath.ObjectNewFieldSelect} element={null} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const SidePanelHostLayout = () => (
  <>
    <Outlet />
    <Routes location="/object/person/record-1">
      <Route
        path={AppPath.RecordShowPage}
        element={<RouteContextStoreProvider />}
      />
    </Routes>
  </>
);

describe('RouteContextStoreProvider', () => {
  it('accepts a query-param view owned by the route object', () => {
    renderOnMainSurface('/objects/companies?viewId=company-view');

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-view-id',
      'company-view',
    );
  });

  it('falls back when the query-param view belongs to another object', () => {
    renderOnMainSurface('/objects/companies?viewId=person-view');

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-view-id',
      'company-index-view',
    );
  });

  it('resolves the object on settings object pages', () => {
    renderOnMainSurface('/settings/objects/companies/new-field/select');

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-object-metadata-id',
      'company-object',
    );
  });

  it('resolves the side panel object from the panel location rather than the main surface route params', () => {
    render(
      <MemoryRouter initialEntries={['/objects/companies']}>
        <Routes>
          <Route element={<SidePanelHostLayout />}>
            <Route path={AppPath.RecordIndexPage} element={null} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('route-context-store')).toHaveAttribute(
      'data-object-metadata-id',
      'person-object',
    );
  });
});
