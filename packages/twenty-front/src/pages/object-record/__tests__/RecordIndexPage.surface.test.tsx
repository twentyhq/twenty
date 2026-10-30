import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

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

describe('RecordIndexPage workspace surface composition', () => {
  beforeEach(() => {
    mockObjectNamePlural = 'people';
    mockCurrentObjectMetadataItemId = 'person-object-metadata-id';
  });

  it('keeps the main page container', () => {
    render(<RecordIndexPage />);

    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('record-index-gater')).toBeInTheDocument();
  });

  it('redirects the legacy workflows index to the workflows page', () => {
    mockObjectNamePlural = 'workflows';
    mockCurrentObjectMetadataItemId = 'workflow-object-metadata-id';

    render(
      <MemoryRouter initialEntries={['/objects/workflows']}>
        <Routes>
          <Route
            path="/objects/:objectNamePlural"
            element={<RecordIndexPage />}
          />
          <Route
            path="/workflows"
            element={<div data-testid="workflow-core-index" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('workflow-core-index')).toBeInTheDocument();
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
        <RecordIndexPage />
      </WorkspaceSurfaceContext.Provider>,
    );

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('record-index-gater')).not.toBeInTheDocument();
  });
});
