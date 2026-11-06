import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowPendingFlowKeysComponentState } from '@/workflow/states/workflowPendingFlowKeysComponentState';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const INSTANCE_ID = 'workflow-visualizer-instance-id';

const mockUpdateWorkflowVersionStep = jest.fn();

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: async () => 'version-id',
  }),
}));
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

const findRecordsStep: WorkflowAction = {
  id: 'find-records',
  name: 'Search Records',
  type: 'FIND_RECORDS',
  valid: true,
  settings: {
    input: { objectName: 'person', limit: 1 },
    outputSchema: {
      first: { isLeaf: true, type: 'string', label: 'Company', value: '' },
    },
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

describe('useSavePendingWorkflowFlow', () => {
  it('puts the schema the server computed for a saved step into the flow', async () => {
    const serverOutputSchema = {
      first: { isLeaf: true, type: 'string', label: 'Person', value: '' },
    };
    mockUpdateWorkflowVersionStep.mockResolvedValue({
      data: {
        updateWorkflowVersionStep: {
          ...findRecordsStep,
          settings: {
            ...findRecordsStep.settings,
            outputSchema: serverOutputSchema,
          },
        },
      },
    });

    const store = createStore();
    const flowAtom = flowComponentState.atomFamily({ instanceId: INSTANCE_ID });
    store.set(flowAtom, {
      workflowVersionId: 'version-id',
      trigger: null,
      steps: [findRecordsStep],
    });
    store.set(
      workflowPendingFlowKeysComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
      [findRecordsStep.id],
    );

    const { result } = renderHook(
      () => useSavePendingWorkflowFlow(INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <JotaiProvider store={store}>
            <WorkflowVisualizerComponentInstanceContext.Provider
              value={{ instanceId: INSTANCE_ID }}
            >
              {children}
            </WorkflowVisualizerComponentInstanceContext.Provider>
          </JotaiProvider>
        ),
      },
    );

    await act(async () => {
      await result.current.saveWorkflowFlowEdits();
    });

    expect(store.get(flowAtom)?.steps?.[0]).toEqual({
      ...findRecordsStep,
      settings: {
        ...findRecordsStep.settings,
        outputSchema: serverOutputSchema,
      },
    });
  });
});
