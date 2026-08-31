import { type WorkflowAction } from '@/workflow/types/Workflow';
import { useReconnectWorkflowEdge } from '@/workflow/workflow-diagram/hooks/useReconnectWorkflowEdge';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { renderHook, waitFor } from '@testing-library/react';

const mockUpdateStep = jest.fn();
const mockUpdateTrigger = jest.fn();
const sourceStep: WorkflowAction = {
  id: 'source',
  name: 'Configured HTTP request',
  type: 'HTTP_REQUEST',
  valid: true,
  settings: {
    input: {
      method: 'POST',
      url: 'https://example.com/contracts',
      headers: { 'Content-Type': 'application/json' },
      body: { contractType: 'direct-sales', companyName: '{{company.name}}' },
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds: ['old'],
};
const mockFlow = {
  trigger: { type: 'MANUAL', settings: {}, nextStepIds: ['old'] },
  steps: [
    sourceStep,
    { ...sourceStep, id: 'old' },
    { ...sourceStep, id: 'new' },
    { ...sourceStep, id: 'old-2', nextStepIds: [] },
    { ...sourceStep, id: 'new-2', nextStepIds: [] },
  ],
};

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockFlow,
  }),
);
jest.mock('@/workflow/workflow-steps/hooks/useUpdateStep', () => ({
  useUpdateStep: () => ({ updateStep: mockUpdateStep }),
}));
jest.mock(
  '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger',
  () => ({
    useUpdateWorkflowVersionTrigger: () => ({
      updateTrigger: mockUpdateTrigger,
    }),
  }),
);

const edge: WorkflowDiagramEdge = {
  id: 'edge',
  source: 'source',
  sourceHandle: 'default',
  target: 'old',
  targetHandle: 'default',
};
const connection = {
  source: 'source',
  sourceHandle: 'default',
  target: 'new',
  targetHandle: 'default',
};

describe('useReconnectWorkflowEdge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sourceStep.nextStepIds = ['old'];
    mockFlow.steps.find((step) => step.id === 'old')!.nextStepIds = [];
  });

  it('persists a replacement as one update without deleting either action', async () => {
    const { result } = renderHook(() => useReconnectWorkflowEdge());
    await result.current.reconnectEdge(edge, connection);
    expect(mockUpdateStep).toHaveBeenCalledTimes(1);
    expect(mockUpdateStep).toHaveBeenCalledWith({
      ...sourceStep,
      nextStepIds: ['new'],
    });
    expect(mockFlow.steps).toHaveLength(5);
    expect(sourceStep.nextStepIds).toEqual(['old']);
  });

  it('keeps the original connection when saving fails', async () => {
    mockUpdateStep.mockRejectedValueOnce(new Error('Save failed'));
    const { result } = renderHook(() => useReconnectWorkflowEdge());
    await expect(
      result.current.reconnectEdge(edge, connection),
    ).rejects.toThrow('Save failed');
    expect(sourceStep.nextStepIds).toEqual(['old']);
  });

  it('updates the trigger in a single operation', async () => {
    const { result } = renderHook(() => useReconnectWorkflowEdge());
    await result.current.reconnectEdge(
      { ...edge, source: 'trigger' },
      { ...connection, source: 'trigger' },
    );
    expect(mockUpdateTrigger).toHaveBeenCalledTimes(1);
    expect(mockUpdateTrigger).toHaveBeenCalledWith({
      ...mockFlow.trigger,
      nextStepIds: ['new'],
    });
    expect(mockUpdateStep).not.toHaveBeenCalled();
  });

  it('serializes rapid reconnections from the same source', async () => {
    sourceStep.nextStepIds = ['old', 'old-2'];
    let finishFirstUpdate: () => void = () => {};
    mockUpdateStep
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finishFirstUpdate = resolve;
          }),
      )
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useReconnectWorkflowEdge());

    const firstReconnection = result.current.reconnectEdge(edge, connection);
    const secondReconnection = result.current.reconnectEdge(
      { ...edge, id: 'edge-2', target: 'old-2' },
      { ...connection, target: 'new-2' },
    );
    await waitFor(() => expect(mockUpdateStep).toHaveBeenCalledTimes(1));
    finishFirstUpdate();
    await Promise.all([firstReconnection, secondReconnection]);

    expect(mockUpdateStep).toHaveBeenCalledTimes(2);
    expect(mockUpdateStep).toHaveBeenLastCalledWith({
      ...sourceStep,
      nextStepIds: ['new', 'new-2'],
    });
  });

  it('ignores reconnections that would create a cycle', async () => {
    sourceStep.nextStepIds = ['new'];
    mockFlow.steps.find((step) => step.id === 'old')!.nextStepIds = ['source'];
    const { result } = renderHook(() => useReconnectWorkflowEdge());

    await result.current.reconnectEdge(
      { ...edge, target: 'new' },
      {
        ...connection,
        target: 'old',
      },
    );

    expect(mockUpdateStep).not.toHaveBeenCalled();
  });

  it.each([
    { ...connection, source: 'different' },
    { ...connection, target: 'missing' },
    { ...connection, target: 'old' },
  ])(
    'ignores invalid or unchanged connections: %j',
    async (invalidConnection) => {
      const { result } = renderHook(() => useReconnectWorkflowEdge());
      await result.current.reconnectEdge(edge, invalidConnection);
      expect(mockUpdateStep).not.toHaveBeenCalled();
      expect(mockUpdateTrigger).not.toHaveBeenCalled();
    },
  );
});
