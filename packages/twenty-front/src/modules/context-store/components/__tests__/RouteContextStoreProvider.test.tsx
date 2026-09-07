import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';
import { render, screen } from '@testing-library/react';

let mockViewIdQueryParam = 'company-view';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/objects/companies',
    search: `?viewId=${mockViewIdQueryParam}`,
    hash: '',
    state: null,
    key: 'test',
  }),
  useParams: () => ({ objectNamePlural: 'companies' }),
  useSearchParams: () => [
    new URLSearchParams(`viewId=${mockViewIdQueryParam}`),
  ],
}));

jest.mock('@/navigation/hooks/useIsSettingsPage', () => ({
  useIsSettingsPage: () => false,
}));

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
  RouteContextStoreProviderEffect: ({ viewId }: { viewId?: string }) => (
    <div data-testid="context-view" data-view-id={viewId} />
  ),
}));

describe('RouteContextStoreProvider view selection', () => {
  beforeEach(() => {
    mockViewIdQueryParam = 'company-view';
  });

  it('accepts a query-param view owned by the route object', () => {
    render(<RouteContextStoreProvider />);

    expect(screen.getByTestId('context-view')).toHaveAttribute(
      'data-view-id',
      'company-view',
    );
  });

  it('falls back when the query-param view belongs to another object', () => {
    mockViewIdQueryParam = 'person-view';

    render(<RouteContextStoreProvider />);

    expect(screen.getByTestId('context-view')).toHaveAttribute(
      'data-view-id',
      'company-index-view',
    );
  });
});
