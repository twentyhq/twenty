import { WorkflowDiagramDefaultEdgeEditable } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramDefaultEdgeEditable';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Position } from '@xyflow/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockStartNodeCreation = jest.fn();

jest.mock('@/workflow/workflow-diagram/hooks/useStartNodeCreation', () => ({
  useStartNodeCreation: () => ({
    startNodeCreation: mockStartNodeCreation,
    isNodeCreationStarted: () => false,
  }),
}));

jest.mock(
  '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBaseEdge',
  () => ({
    WorkflowDiagramBaseEdge: () => null,
  }),
);

jest.mock(
  '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup',
  () => ({
    WorkflowDiagramEdgeButtonGroup: ({
      iconButtons,
    }: {
      iconButtons: Array<{ onClick: () => void; ariaLabel: string }>;
    }) => (
      <>
        {iconButtons.map((iconButton) => (
          <button key={iconButton.ariaLabel} onClick={iconButton.onClick}>
            {iconButton.ariaLabel}
          </button>
        ))}
      </>
    ),
  }),
);

jest.mock(
  '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer',
  () => ({
    WorkflowDiagramEdgeV2VisibilityContainer: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
  }),
);

jest.mock(
  '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState',
  () => ({
    useEdgeState: () => ({
      isEdgeHovered: () => true,
    }),
  }),
);

jest.mock('@/workflow/workflow-steps/hooks/useDeleteEdge', () => ({
  useDeleteEdge: () => ({
    deleteEdge: jest.fn(),
  }),
}));

jest.mock('@xyflow/react', () => ({
  ...jest.requireActual('@xyflow/react'),
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => children,
}));

const edgeProps: WorkflowDiagramEdgeComponentProps = {
  id: 'edge-id',
  source: 'if-else-id',
  sourceHandleId: 'default',
  sourcePosition: Position.Bottom,
  sourceX: 100,
  sourceY: 100,
  target: 'action-id',
  targetHandleId: 'default',
  targetPosition: Position.Top,
  targetX: 100,
  targetY: 200,
  markerStart: undefined,
  markerEnd: undefined,
  data: {
    edgeType: 'default',
    sourceConnectionOptions: {
      connectedStepType: 'IF_ELSE',
      settings: { branchId: 'branch-if' },
    },
  },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderEdge = (deletable: boolean) =>
  render(
    <WorkflowDiagramDefaultEdgeEditable
      id={edgeProps.id}
      source={edgeProps.source}
      sourceHandleId={edgeProps.sourceHandleId}
      sourcePosition={edgeProps.sourcePosition}
      sourceX={edgeProps.sourceX}
      sourceY={edgeProps.sourceY}
      target={edgeProps.target}
      targetHandleId={edgeProps.targetHandleId}
      targetPosition={edgeProps.targetPosition}
      targetX={edgeProps.targetX}
      targetY={edgeProps.targetY}
      data={edgeProps.data}
      deletable={deletable}
    />,
    { wrapper: Wrapper },
  );

describe('WorkflowDiagramDefaultEdgeEditable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts on each shared-destination branch using its own control and branch identity', async () => {
    const user = userEvent.setup();
    render(
      <>
        {['if', 'else'].map((branchId, index) => (
          <WorkflowDiagramDefaultEdgeEditable
            key={branchId}
            id={branchId}
            source={edgeProps.source}
            sourceHandleId={edgeProps.sourceHandleId}
            sourcePosition={edgeProps.sourcePosition}
            sourceX={edgeProps.sourceX}
            sourceY={edgeProps.sourceY}
            target={edgeProps.target}
            targetHandleId={branchId}
            targetPosition={edgeProps.targetPosition}
            targetX={edgeProps.targetX}
            targetY={edgeProps.targetY}
            deletable={false}
            data={{
              edgeType: 'default',
              edgePathStrategy: 'parallel-edge',
              parallelEdgeOffset: index === 0 ? -50 : 50,
              sourceConnectionOptions: {
                connectedStepType: 'IF_ELSE',
                settings: { branchId },
              },
            }}
          />
        ))}
      </>,
      { wrapper: Wrapper },
    );

    const buttons = screen.getAllByRole('button', { name: 'Insert action' });
    await user.click(buttons[0]);
    await user.click(buttons[1]);

    expect(
      mockStartNodeCreation.mock.calls.map(([options]) => options),
    ).toEqual([
      {
        parentStepId: edgeProps.source,
        nextStepId: edgeProps.target,
        position: { x: 50, y: 150 },
        connectionOptions: {
          connectedStepType: 'IF_ELSE',
          settings: { branchId: 'if' },
        },
      },
      {
        parentStepId: edgeProps.source,
        nextStepId: edgeProps.target,
        position: { x: 150, y: 150 },
        connectionOptions: {
          connectedStepType: 'IF_ELSE',
          settings: { branchId: 'else' },
        },
      },
    ]);
  });

  it('allows inserting an action on a non-deletable branch', async () => {
    const user = userEvent.setup();
    renderEdge(false);

    expect(
      screen.queryByRole('button', { name: 'Delete connection' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Insert action' }));

    expect(mockStartNodeCreation).toHaveBeenCalledWith(
      expect.objectContaining({
        parentStepId: 'if-else-id',
        nextStepId: 'action-id',
        connectionOptions: {
          connectedStepType: 'IF_ELSE',
          settings: { branchId: 'branch-if' },
        },
      }),
    );
  });

  it('keeps the delete action for deletable edges', () => {
    renderEdge(true);

    expect(
      screen.getByRole('button', { name: 'Insert action' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Delete connection' }),
    ).toBeInTheDocument();
  });
});
