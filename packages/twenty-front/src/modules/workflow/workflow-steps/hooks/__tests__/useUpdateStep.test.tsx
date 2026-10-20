import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowPendingFlowKeysComponentState } from '@/workflow/states/workflowPendingFlowKeysComponentState';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';

const mockUpdateWorkflowVersionStep = jest.fn();
const mockGetUpdatableWorkflowVersion = jest.fn();

jest.mock(
  '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep',
  () => ({
    useUpdateWorkflowVersionStep: () => ({
      updateWorkflowVersionStep: mockUpdateWorkflowVersionStep,
    }),
  }),
);

jest.mock(
  '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger',
  () => ({
    useUpdateWorkflowVersionTrigger: () => ({
      updateWorkflowVersionTrigger: jest.fn(),
    }),
  }),
);

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));

const WORKFLOW_VERSION_ID = 'version-123';

const buildCodeStep = (
  logicFunctionInput: Record<string, string>,
): WorkflowCodeAction => ({
  id: 'step-1',
  name: 'Code',
  valid: true,
  type: 'CODE',
  settings: {
    input: { logicFunctionId: 'logic-function-id', logicFunctionInput },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 3 },
      continueOnFailure: { value: true },
    },
  },
});

const renderUpdateStep = () => {
  const store = createStore();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{ instanceId: 'workflow-visualizer-instance-id' }}
      >
        {children}
      </WorkflowVisualizerComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  const { result } = renderHook(
    () => ({
      ...useUpdateStep(),
      ...useSavePendingWorkflowFlow(),
      flow: useAtomComponentStateValue(flowComponentState),
      pendingFlowKeys: useAtomComponentStateValue(
        workflowPendingFlowKeysComponentState,
      ),
    }),
    { wrapper },
  );

  act(() => {
    store.set(
      flowComponentState.atomFamily({
        instanceId: 'workflow-visualizer-instance-id',
      }),
      {
        workflowVersionId: WORKFLOW_VERSION_ID,
        trigger: null,
        steps: [buildCodeStep({ value: '' })],
      },
    );
  });

  return result;
};

describe('useUpdateStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUpdatableWorkflowVersion.mockResolvedValue(WORKFLOW_VERSION_ID);
  });

  it('writes the step into the flow and saves it', async () => {
    mockUpdateWorkflowVersionStep.mockResolvedValue({
      data: { updateWorkflowVersionStep: buildCodeStep({ value: '1' }) },
    });

    const result = renderUpdateStep();

    await act(async () => {
      await result.current.updateStep(buildCodeStep({ value: '1' }));
    });

    expect(result.current.flow?.steps?.[0]).toEqual(
      buildCodeStep({ value: '1' }),
    );
    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledWith({
      workflowVersionId: WORKFLOW_VERSION_ID,
      step: buildCodeStep({ value: '1' }),
    });
    expect(result.current.pendingFlowKeys).toEqual([]);
  });

  it('batches edits made during a save and keeps the latest value when the older response lands', async () => {
    let resolveFirstSave: (value: unknown) => void = () => undefined;

    mockUpdateWorkflowVersionStep.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirstSave = resolve;
        }),
    );
    mockUpdateWorkflowVersionStep.mockResolvedValue({
      data: { updateWorkflowVersionStep: buildCodeStep({ value: '100' }) },
    });

    const result = renderUpdateStep();

    let saves: Promise<void>[] = [];

    await act(async () => {
      saves = [
        result.current.updateStep(buildCodeStep({ value: '1' })),
        result.current.updateStep(buildCodeStep({ value: '10' })),
        result.current.updateStep(buildCodeStep({ value: '100' })),
      ];
    });

    await act(async () => {
      resolveFirstSave({
        data: { updateWorkflowVersionStep: buildCodeStep({ value: '1' }) },
      });
      await Promise.all(saves);
    });

    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledTimes(2);
    expect(mockUpdateWorkflowVersionStep).toHaveBeenLastCalledWith({
      workflowVersionId: WORKFLOW_VERSION_ID,
      step: buildCodeStep({ value: '100' }),
    });
    expect(result.current.flow?.steps?.[0]).toEqual(
      buildCodeStep({ value: '100' }),
    );
  });

  it('keeps a failed save local and retries it with the next save', async () => {
    mockUpdateWorkflowVersionStep.mockResolvedValueOnce(undefined);
    mockUpdateWorkflowVersionStep.mockResolvedValueOnce({
      data: { updateWorkflowVersionStep: buildCodeStep({ value: '1' }) },
    });

    const result = renderUpdateStep();

    await act(async () => {
      await result.current.updateStep(buildCodeStep({ value: '1' }));
    });

    expect(result.current.pendingFlowKeys).toEqual([]);
    expect(result.current.flow?.steps?.[0]).toEqual(
      buildCodeStep({ value: '1' }),
    );

    await act(async () => {
      await result.current.savePendingWorkflowFlow();
    });

    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledTimes(2);
    expect(mockUpdateWorkflowVersionStep).toHaveBeenLastCalledWith({
      workflowVersionId: WORKFLOW_VERSION_ID,
      step: buildCodeStep({ value: '1' }),
    });
  });

  it('saves immediately with updateStepNow and applies the saved step', async () => {
    const savedStep = { ...buildCodeStep({ value: '1' }), name: 'Saved' };

    mockUpdateWorkflowVersionStep.mockResolvedValue({
      data: { updateWorkflowVersionStep: savedStep },
    });

    const result = renderUpdateStep();

    await act(async () => {
      await result.current.updateStepNow(buildCodeStep({ value: '1' }));
    });

    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledWith({
      workflowVersionId: WORKFLOW_VERSION_ID,
      step: buildCodeStep({ value: '1' }),
    });
    expect(result.current.flow?.steps?.[0]).toEqual(savedStep);
  });
});
