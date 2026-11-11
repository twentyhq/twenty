import { render, screen } from '@testing-library/react';

import { CoreWorkflowEditor } from '@/object-core/workflows/components/CoreWorkflowEditor';

type MockCoreWorkflowVersionResult = {
  coreWorkflowVersion: { id: string; coreWorkflowId: string } | null;
  previousCoreWorkflowVersion: { id: string; coreWorkflowId: string } | null;
  loading: boolean;
};

const WORKFLOW_ID = 'workflow-id';
const ACTIVE_VERSION = { id: 'active-version-id', coreWorkflowId: WORKFLOW_ID };

const mockCoreWorkflowVersionResult: {
  current: MockCoreWorkflowVersionResult;
} = {
  current: {
    coreWorkflowVersion: null,
    previousCoreWorkflowVersion: null,
    loading: true,
  },
};
const mockOnDiagramEffectMount = jest.fn();

jest.mock(
  '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion',
  () => ({
    useCoreWorkflowVersion: () => ({
      ...mockCoreWorkflowVersionResult.current,
      error: undefined,
      refetchCoreWorkflowVersion: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/workflow/workflow-diagram/components/WorkflowDiagramEffect',
  () => ({
    WorkflowDiagramEffect: () => {
      jest.requireActual('react').useState(mockOnDiagramEffectMount);

      return null;
    },
  }),
);

jest.mock(
  '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable',
  () => ({
    WorkflowDiagramCanvasEditable: () => <div>Workflow canvas</div>,
  }),
);

jest.mock(
  '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect',
  () => ({
    WorkflowVisualizerEffect: () => null,
  }),
);

jest.mock(
  '@/object-core/workflows/versions/components/CoreWorkflowVersionCard',
  () => ({
    CoreWorkflowVersionCard: () => <div>Read-only version</div>,
  }),
);

jest.mock(
  '@/object-core/workflows/hooks/useListenToCoreWorkflowEvents',
  () => ({
    useListenToCoreWorkflowEvents: jest.fn(),
  }),
);

describe('CoreWorkflowEditor', () => {
  beforeEach(() => {
    mockOnDiagramEffectMount.mockClear();
  });

  it('keeps the editable canvas mounted while a new current version loads', () => {
    mockCoreWorkflowVersionResult.current = {
      coreWorkflowVersion: ACTIVE_VERSION,
      previousCoreWorkflowVersion: null,
      loading: false,
    };

    const { rerender } = render(
      <CoreWorkflowEditor
        coreWorkflowId={WORKFLOW_ID}
        coreWorkflowVersionId="active-version-id"
        readonly={false}
      />,
    );

    expect(screen.getByText('Workflow canvas')).toBeInTheDocument();

    mockCoreWorkflowVersionResult.current = {
      coreWorkflowVersion: null,
      previousCoreWorkflowVersion: ACTIVE_VERSION,
      loading: true,
    };

    rerender(
      <CoreWorkflowEditor
        coreWorkflowId={WORKFLOW_ID}
        coreWorkflowVersionId="draft-version-id"
        readonly={false}
      />,
    );

    expect(screen.getByText('Workflow canvas')).toBeInTheDocument();
    expect(mockOnDiagramEffectMount).toHaveBeenCalledTimes(1);
  });

  it('reports a missing current version once it has loaded, instead of keeping the previous one', () => {
    mockCoreWorkflowVersionResult.current = {
      coreWorkflowVersion: null,
      previousCoreWorkflowVersion: ACTIVE_VERSION,
      loading: false,
    };

    render(
      <CoreWorkflowEditor
        coreWorkflowId={WORKFLOW_ID}
        coreWorkflowVersionId="deleted-version-id"
        readonly={false}
      />,
    );

    expect(screen.getByText('Workflow version not found.')).toBeInTheDocument();
    expect(screen.queryByText('Workflow canvas')).not.toBeInTheDocument();
  });

  it('does not show a previous version while a read-only version loads', () => {
    mockCoreWorkflowVersionResult.current = {
      coreWorkflowVersion: null,
      previousCoreWorkflowVersion: ACTIVE_VERSION,
      loading: true,
    };

    render(
      <CoreWorkflowEditor
        coreWorkflowId={WORKFLOW_ID}
        coreWorkflowVersionId="archived-version-id"
        readonly
      />,
    );

    expect(screen.queryByText('Read-only version')).not.toBeInTheDocument();
  });
});
