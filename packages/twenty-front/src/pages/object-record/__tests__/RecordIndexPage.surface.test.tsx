import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import { render, screen } from '@testing-library/react';

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

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { labelPlural: 'Workflows' },
  }),
}));

jest.mock('@/object-core/workflows/hooks/useCoreWorkflows', () => ({
  CORE_WORKFLOWS_INITIAL_SORT: [],
  CORE_WORKFLOWS_TABLE_ID: 'workflow-table',
  useCoreWorkflows: () => ({
    coreWorkflows: [{ id: 'workflow-1' }],
    hasNextPage: false,
    loading: false,
    error: undefined,
    fetchNextPage: jest.fn(),
  }),
}));

jest.mock('@/object-core/workflows/hooks/useCreateCoreWorkflow', () => ({
  useCreateCoreWorkflow: () => ({
    createCoreWorkflow: jest.fn(),
    canCreateCoreWorkflow: false,
    isCreatingCoreWorkflow: false,
  }),
}));

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: false }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({}),
}));

jest.mock(
  '@/object-core/workflows/hooks/useListenToCoreWorkflowEvents',
  () => ({
    useListenToCoreWorkflowEvents: () => undefined,
  }),
);

jest.mock('@/object-core/components/CoreObjectTable', () => ({
  CoreObjectTable: () => <div data-testid="workflow-core-index" />,
}));

jest.mock(
  '@/object-core/workflows/components/CoreWorkflowsSelectionToContextStoreEffect',
  () => ({
    CoreWorkflowsSelectionToContextStoreEffect: () => null,
  }),
);

jest.mock('@/ui/layout/page/components/PageCardHeader', () => ({
  PageCardHeader: () => null,
}));

jest.mock('@/ui/layout/page/components/PageCardLayout', () => ({
  PageCardLayout: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/ui/utilities/page-title/components/PageTitle', () => ({
  PageTitle: () => null,
}));

describe('RecordIndexPage workspace surface composition', () => {
  beforeAll(async () => {
    await import('~/pages/object-core/WorkflowCoreIndexPage');
  });

  beforeEach(() => {
    mockObjectNamePlural = 'people';
    mockCurrentObjectMetadataItemId = 'person-object-metadata-id';
  });

  it('keeps the main page container', () => {
    render(<RecordIndexPage />);

    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('record-index-gater')).toBeInTheDocument();
  });

  it('hosts the same specialized workflow index on a secondary surface', async () => {
    mockObjectNamePlural = 'workflows';
    mockCurrentObjectMetadataItemId = 'workflow-object-metadata-id';

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

    expect(screen.queryByTestId('page-container')).not.toBeInTheDocument();
    expect(
      await screen.findByTestId('workflow-core-index', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
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
