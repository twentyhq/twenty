import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { WorkflowCoreShowPage } from '~/pages/object-core/WorkflowCoreShowPage';

const WORKFLOW_ID = 'workflow-id';

type MockCoreWorkflowVersion = {
  id: string;
  status: string;
  createdAt: string;
};

const ACTIVE_VERSION: MockCoreWorkflowVersion = {
  id: 'active-version-id',
  status: 'ACTIVE',
  createdAt: '2026-10-01T10:00:00.000Z',
};

const DRAFT_VERSION: MockCoreWorkflowVersion = {
  id: 'draft-version-id',
  status: 'DRAFT',
  createdAt: '2026-10-02T10:00:00.000Z',
};

const mockCoreWorkflowVersions: { current: MockCoreWorkflowVersion[] } = {
  current: [],
};
const mockOnEditorMount = jest.fn();

jest.mock('@/object-core/workflows/components/CoreWorkflowEditor', () => ({
  CoreWorkflowEditor: ({
    coreWorkflowVersionId,
    readonly,
  }: {
    coreWorkflowVersionId: string;
    readonly: boolean;
  }) => {
    jest.requireActual('react').useState(mockOnEditorMount);

    return (
      <div>
        {`${readonly ? 'Read-only' : 'Editable'} editor for ${coreWorkflowVersionId}`}
      </div>
    );
  },
}));

jest.mock(
  '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions',
  () => ({
    useCoreWorkflowVersions: () => ({
      coreWorkflowVersions: mockCoreWorkflowVersions.current,
      loading: false,
      error: undefined,
      refetchCoreWorkflowVersions: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource',
  () => ({
    useCoreWorkflowShowPageResource: () => ({
      record: { id: 'workflow-id', name: 'My workflow' },
      coreWorkflow: { id: 'workflow-id', applicationId: undefined },
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-core/workflows/components/CoreWorkflowsPermissionGate',
  () => ({
    CoreWorkflowsPermissionGate: ({ children }: { children: ReactNode }) =>
      children,
  }),
);

jest.mock(
  '@/object-core/workflows/hooks/useCoreWorkflowShowPageActiveTab',
  () => ({
    useCoreWorkflowShowPageActiveTab: () =>
      jest.requireActual(
        '@/object-core/workflows/constants/CoreWorkflowShowPageTabs',
      ).CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW,
  }),
);

jest.mock(
  '@/object-core/workflows/components/CoreWorkflowShowPageTabList',
  () => ({
    CoreWorkflowShowPageTabList: () => null,
  }),
);

jest.mock('@/ui/layout/page/components/PageCardLayout', () => ({
  PageCardLayout: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/applications/hooks/useIsThirdPartyApplication', () => ({
  useIsThirdPartyApplication: () => false,
}));

jest.mock(
  '@/object-core/workflows/hooks/useListenToCoreWorkflowEvents',
  () => ({
    useListenToCoreWorkflowEvents: jest.fn(),
  }),
);

jest.mock('@/object-core/workflows/hooks/useRenameCoreWorkflow', () => ({
  useRenameCoreWorkflow: () => ({ renameWorkflow: jest.fn() }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));

jest.mock('@/object-core/components/CoreObjectIdentifierBar', () => ({
  CoreObjectIdentifierBar: () => null,
}));

jest.mock(
  '@/object-record/record-show/components/RecordShowPageResourceEffect',
  () => ({
    RecordShowPageResourceEffect: () => null,
  }),
);

jest.mock(
  '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect',
  () => ({
    RecordShowContainerContextStoreTargetedRecordsEffect: () => null,
  }),
);

jest.mock('@/ui/utilities/page-title/components/PageTitle', () => ({
  PageTitle: () => null,
}));

const renderWorkflowCoreShowPage = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/workflow/:coreWorkflowId"
          element={<WorkflowCoreShowPage />}
        />
      </Routes>
    </MemoryRouter>,
  );

describe('WorkflowCoreShowPage', () => {
  beforeEach(() => {
    mockOnEditorMount.mockClear();
  });

  it('keeps the editable editor mounted when a draft becomes the current version', () => {
    mockCoreWorkflowVersions.current = [ACTIVE_VERSION];

    const { rerender } = renderWorkflowCoreShowPage(`/workflow/${WORKFLOW_ID}`);

    expect(
      screen.getByText('Editable editor for active-version-id'),
    ).toBeInTheDocument();

    mockCoreWorkflowVersions.current = [ACTIVE_VERSION, DRAFT_VERSION];

    rerender(
      <MemoryRouter initialEntries={[`/workflow/${WORKFLOW_ID}`]}>
        <Routes>
          <Route
            path="/workflow/:coreWorkflowId"
            element={<WorkflowCoreShowPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Editable editor for draft-version-id'),
    ).toBeInTheDocument();
    expect(mockOnEditorMount).toHaveBeenCalledTimes(1);
  });

  it('shows a requested version in a read-only editor', () => {
    mockCoreWorkflowVersions.current = [ACTIVE_VERSION, DRAFT_VERSION];

    renderWorkflowCoreShowPage(
      `/workflow/${WORKFLOW_ID}?version=${ACTIVE_VERSION.id}`,
    );

    expect(
      screen.getByText('Read-only editor for active-version-id'),
    ).toBeInTheDocument();
  });
});
