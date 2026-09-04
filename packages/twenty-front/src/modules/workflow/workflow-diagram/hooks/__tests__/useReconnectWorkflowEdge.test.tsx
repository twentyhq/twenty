import { flowComponentState } from '@/workflow/states/flowComponentState';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { useReconnectWorkflowEdge } from '@/workflow/workflow-diagram/hooks/useReconnectWorkflowEdge';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const mockUpdateStep = jest.fn();
const mockUpdateTrigger = jest.fn();
const workflowVisualizerComponentInstanceId = 'workflow-visualizer-instance-id';
let jotaiStore: ReturnType<typeof createStore>;

const createAction = (
  id: string,
  nextStepIds: string[] = [],
): WorkflowAction => ({
  id,
  name: id,
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
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds,
});

const flowAtom = () =>
  flowComponentState.atomFamily({
    instanceId: workflowVisualizerComponentInstanceId,
  });

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{ instanceId: workflowVisualizerComponentInstanceId }}
    >
      {children}
    </WorkflowVisualizerComponentInstanceContext.Provider>
  </JotaiProvider>
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
    jotaiStore = createStore();
    jotaiStore.set(flowAtom(), {
      workflowVersionId: 'workflow-version-id',
      trigger: {
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: ['old'],
      },
      steps: [
        createAction('source', ['old']),
        createAction('old'),
        createAction('new'),
        createAction('old-2'),
        createAction('new-2'),
      ],
    });
    mockUpdateStep.mockImplementation(async (updatedStep: WorkflowAction) => {
      jotaiStore.set(flowAtom(), (flow) =>
        !flow
          ? flow
          : {
              ...flow,
              steps:
                flow.steps?.map((step) =>
                  step.id === updatedStep.id ? updatedStep : step,
                ) ?? null,
            },
      );

      return { updatedStep };
    });
    mockUpdateTrigger.mockImplementation(async (updatedTrigger) => {
      jotaiStore.set(flowAtom(), (flow) =>
        !flow ? flow : { ...flow, trigger: updatedTrigger },
      );
    });
  });

  it('persists a replacement as one update without deleting either action', async () => {
    const { result } = renderHook(() => useReconnectWorkflowEdge(), {
      wrapper: Wrapper,
    });

    await expect(result.current.reconnectEdge(edge, connection)).resolves.toBe(
      true,
    );
    expect(mockUpdateStep).toHaveBeenCalledTimes(1);
    expect(mockUpdateStep).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'source', nextStepIds: ['new'] }),
    );
    expect(jotaiStore.get(flowAtom())?.steps).toHaveLength(5);
  });

  it('reports a failed save without recording the attempted update', async () => {
    mockUpdateStep.mockResolvedValueOnce({ updatedStep: undefined });
    const { result } = renderHook(() => useReconnectWorkflowEdge(), {
      wrapper: Wrapper,
    });

    await expect(result.current.reconnectEdge(edge, connection)).resolves.toBe(
      false,
    );
    expect(
      jotaiStore.get(flowAtom())?.steps?.find((step) => step.id === 'source')
        ?.nextStepIds,
    ).toEqual(['old']);
  });

  it('updates the trigger in a single operation', async () => {
    const { result } = renderHook(() => useReconnectWorkflowEdge(), {
      wrapper: Wrapper,
    });

    await expect(
      result.current.reconnectEdge(
        { ...edge, source: 'trigger' },
        { ...connection, source: 'trigger' },
      ),
    ).resolves.toBe(true);
    expect(mockUpdateTrigger).toHaveBeenCalledTimes(1);
    expect(mockUpdateTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ nextStepIds: ['new'] }),
    );
    expect(mockUpdateStep).not.toHaveBeenCalled();
  });

  it('reports a failed trigger save without recording the attempted update', async () => {
    mockUpdateTrigger.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useReconnectWorkflowEdge(), {
      wrapper: Wrapper,
    });

    await expect(
      result.current.reconnectEdge(
        { ...edge, source: 'trigger' },
        { ...connection, source: 'trigger' },
      ),
    ).resolves.toBe(false);
    expect(jotaiStore.get(flowAtom())?.trigger?.nextStepIds).toEqual(['old']);
  });

  it('ignores reconnections that would create a cycle', async () => {
    jotaiStore.set(flowAtom(), (flow) => ({
      ...flow!,
      steps:
        flow?.steps?.map((step) => {
          if (step.id === 'source') {
            return { ...step, nextStepIds: ['new'] };
          }

          return step.id === 'old'
            ? { ...step, nextStepIds: ['source'] }
            : step;
        }) ?? null,
    }));
    const { result } = renderHook(() => useReconnectWorkflowEdge(), {
      wrapper: Wrapper,
    });

    await expect(
      result.current.reconnectEdge(
        { ...edge, target: 'new' },
        { ...connection, target: 'old' },
      ),
    ).resolves.toBe(false);

    expect(mockUpdateStep).not.toHaveBeenCalled();
  });

  it.each([
    { ...connection, source: 'different' },
    { ...connection, target: 'missing' },
    { ...connection, target: 'old' },
  ])(
    'ignores invalid or unchanged connections: %j',
    async (invalidConnection) => {
      const { result } = renderHook(() => useReconnectWorkflowEdge(), {
        wrapper: Wrapper,
      });

      await expect(
        result.current.reconnectEdge(edge, invalidConnection),
      ).resolves.toBe(false);
      expect(mockUpdateStep).not.toHaveBeenCalled();
      expect(mockUpdateTrigger).not.toHaveBeenCalled();
    },
  );
});
