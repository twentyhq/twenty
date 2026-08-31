import { type WorkflowAction } from '@/workflow/types/Workflow';
import { useReconnectWorkflowEdge } from '@/workflow/workflow-diagram/hooks/useReconnectWorkflowEdge';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { renderHook } from '@testing-library/react';

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
  beforeEach(() => jest.clearAllMocks());

  it('persists a replacement as one update without deleting either action', async () => {
    const { result } = renderHook(() => useReconnectWorkflowEdge());
    await result.current.reconnectEdge(edge, connection);
    expect(mockUpdateStep).toHaveBeenCalledTimes(1);
    expect(mockUpdateStep).toHaveBeenCalledWith({
      ...sourceStep,
      nextStepIds: ['new'],
    });
    expect(mockFlow.steps).toHaveLength(3);
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
    expect(mockUpdateTrigger).toHaveBeenCalledWith({
      ...mockFlow.trigger,
      nextStepIds: ['new'],
    });
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
