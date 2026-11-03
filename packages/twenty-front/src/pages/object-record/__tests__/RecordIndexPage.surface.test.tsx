import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

let mockObjectNamePlural = 'people';
let mockCurrentObjectMetadataItemId = 'person-object-metadata-id';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ objectNamePlural: mockObjectNamePlural }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockCurrentObjectMetadataItemId,
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => ({ status: 'up-to-date' }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      {
        id: 'person-object-metadata-id',
        nameSingular: 'person',
        namePlural: 'people',
      },
      {
        id: 'workflow-object-metadata-id',
        nameSingular: 'workflow',
        namePlural: 'workflows',
      },
    ],
  }),
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => false,
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => true,
}));

jest.mock(
  '@/object-record/record-index/components/RecordIndexContainerGater',
  () => ({
    RecordIndexContainerGater: () => <div data-testid="record-index-gater" />,
  }),
);

jest.mock('@/ui/layout/page/components/PageContainer', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
}));

jest.mock('@/ui/layout/page/components/WorkspaceRouteUnavailable', () => ({
  WorkspaceRouteUnavailable: () => <div data-testid="route-unavailable" />,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({}),
}));

const LocationProbe = () => {
  const location = useLocation();

  return (
    <div data-testid="workflows-page">
      {location.pathname + location.search}
    </div>
  );
};

describe('RecordIndexPage workspace surface composition', () => {
  beforeEach(() => {
    mockObjectNamePlural = 'people';
    mockCurrentObjectMetadataItemId = 'person-object-metadata-id';
  });

  it('keeps the main page container', () => {
    render(
      <MemoryRouter>
        <RecordIndexPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('record-index-gater')).toBeInTheDocument();
  });

  it('redirects the legacy workflows index to the workflows page', () => {
    mockObjectNamePlural = 'workflows';
    mockCurrentObjectMetadataItemId = 'workflow-object-metadata-id';

    render(
      <MemoryRouter initialEntries={['/objects/workflows?panel=%2Fagents']}>
        <Routes>
          <Route
            path="/objects/:objectNamePlural"
            element={<RecordIndexPage />}
          />
          <Route path="/workflows" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('workflows-page')).toHaveTextContent(
      '/workflows?panel=%2Fagents',
    );
    expect(screen.queryByTestId('record-index-gater')).not.toBeInTheDocument();
  });

  it('renders a panel-local fallback for a removed object', () => {
    mockObjectNamePlural = 'removedObjects';

    render(
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: 'side-panel-page-1',
          ownsRouteLocation: true,
        }}
      >
        <MemoryRouter>
          <RecordIndexPage />
        </MemoryRouter>
      </WorkspaceSurfaceContext.Provider>,
    );

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('record-index-gater')).not.toBeInTheDocument();
  });
});
