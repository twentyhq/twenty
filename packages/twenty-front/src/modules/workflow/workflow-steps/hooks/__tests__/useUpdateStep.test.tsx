import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowUnsavedFlowKeysComponentState } from '@/workflow/states/workflowUnsavedFlowKeysComponentState';
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

const buildCodeStep = (logicFunctionInput: Record<string, string>) =>
  ({
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
  }) as WorkflowCodeAction;

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
      ...useSaveUnsavedWorkflowFlow(),
      flow: useAtomComponentStateValue(flowComponentState),
      unsavedFlowKeys: useAtomComponentStateValue(
        workflowUnsavedFlowKeysComponentState,
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

  it('writes the step into the flow without saving it', () => {
    const result = renderUpdateStep();

    act(() => {
      result.current.updateStep(buildCodeStep({ value: '1' }));
    });

    expect(result.current.flow?.steps?.[0]).toEqual(
      buildCodeStep({ value: '1' }),
    );
    expect(result.current.unsavedFlowKeys).toEqual(['step-1']);
    expect(mockUpdateWorkflowVersionStep).not.toHaveBeenCalled();
  });

  it('saves the latest flow value once and keeps it when an older response lands', async () => {
    mockUpdateWorkflowVersionStep.mockResolvedValue({
      data: { updateWorkflowVersionStep: buildCodeStep({ value: '1' }) },
    });

    const result = renderUpdateStep();

    act(() => {
      result.current.updateStep(buildCodeStep({ value: '1' }));
      result.current.updateStep(buildCodeStep({ value: '10' }));
    });

    await act(async () => {
      await result.current.saveUnsavedWorkflowFlow();
    });

    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledTimes(1);
    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledWith({
      workflowVersionId: WORKFLOW_VERSION_ID,
      step: buildCodeStep({ value: '10' }),
    });
    expect(result.current.flow?.steps?.[0]).toEqual(
      buildCodeStep({ value: '10' }),
    );
    expect(result.current.unsavedFlowKeys).toEqual([]);
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
