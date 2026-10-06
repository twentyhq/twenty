import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let mockObjectNamePlural = 'people';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ objectNamePlural: mockObjectNamePlural }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => 'person-object-metadata-id',
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
    ],
  }),
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

jest.mock('@/app/routing/components/WorkspaceRouteUnavailable', () => ({
  WorkspaceRouteUnavailable: () => <div data-testid="route-unavailable" />,
}));

describe('RecordIndexPage workspace surface composition', () => {
  beforeEach(() => {
    mockObjectNamePlural = 'people';
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

  it('redirects the former workflow object index to the workflows page', () => {
    mockObjectNamePlural = 'workflows';

    render(
      <MemoryRouter initialEntries={['/objects/workflows?viewId=legacy']}>
        <Routes>
          <Route
            path="/objects/:objectNamePlural"
            element={<RecordIndexPage />}
          />
          <Route
            path="/workflows"
            element={<div data-testid="workflows-page" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('workflows-page')).toBeInTheDocument();
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
