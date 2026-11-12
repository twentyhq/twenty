import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const mockMutate = jest.fn();
const mockMarkStepForRecomputation = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ cache: {} }),
}));

jest.mock(
  '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions',
  () => ({ invalidateCoreWorkflowVersions: jest.fn() }),
);

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: jest.fn(() => ({
    markStepForRecomputation: mockMarkStepForRecomputation,
  })),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockMutate],
}));

const Wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    WorkflowVisualizerComponentInstanceContext.Provider,
    { value: { instanceId: 'workflow-visualizer-test' } },
    children,
  );

describe('useUpdateWorkflowVersionTrigger', () => {
  const trigger: WorkflowTrigger = {
    name: 'Company created',
    type: 'DATABASE_EVENT',
    settings: {
      eventName: 'company.created',
      outputSchema: {},
    },
    nextStepIds: ['step1'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockResolvedValue({
      data: { updateWorkflowVersionTrigger: { trigger } },
    });
  });

  it('updates the trigger via the dedicated mutation and marks it for recomputation', async () => {
    const { result } = renderHook(() => useUpdateWorkflowVersionTrigger(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.updateWorkflowVersionTrigger({
        workflowVersionId: 'version-id',
        trigger,
      });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            coreWorkflowVersionId: 'version-id',
            trigger,
          },
        },
      }),
    );
    expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
      stepId: TRIGGER_STEP_ID,
      workflowVersionId: 'version-id',
    });
  });

  it('marks for recomputation for all trigger types', async () => {
    const testTriggers: WorkflowTrigger[] = [
      {
        name: 'DATABASE_EVENT Trigger',
        type: 'DATABASE_EVENT',
        settings: { eventName: 'company.created', outputSchema: {} },
        nextStepIds: [],
      },
      {
        name: 'MANUAL Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
      },
      {
        name: 'CRON Trigger',
        type: 'CRON',
        settings: { type: 'CUSTOM', pattern: '0 0 * * *', outputSchema: {} },
        nextStepIds: [],
      },
      {
        name: 'WEBHOOK Trigger',
        type: 'WEBHOOK',
        settings: {
          httpMethod: 'GET',
          authentication: null,
          outputSchema: {},
        },
        nextStepIds: [],
      },
    ];

    for (const testTrigger of testTriggers) {
      mockMarkStepForRecomputation.mockClear();

      const { result } = renderHook(() => useUpdateWorkflowVersionTrigger(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.updateWorkflowVersionTrigger({
          workflowVersionId: 'version-id',
          trigger: testTrigger,
        });
      });

      expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
        stepId: TRIGGER_STEP_ID,
        workflowVersionId: 'version-id',
      });
    }
  });
});
