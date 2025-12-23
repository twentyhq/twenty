import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';

const mockGetUpdatableWorkflowVersion = jest.fn();
const mockCreateWorkflowVersionStep = jest.fn().mockResolvedValue({
  data: {
    createWorkflowVersionStep: {
      stepsDiff: [
        {
          type: 'CREATE',
          path: ['steps', 0],
          value: { id: 'step-id', type: 'CODE' },
        },
      ],
    },
  },
});

jest.mock(
  '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep',
  () => ({
    useCreateWorkflowVersionStep: () => ({
      createWorkflowVersionStep: mockCreateWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

jest.mock('uuid', () => ({ v4: () => 'step-id' }));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const workflowVisualizerComponentInstanceId =
    'workflow-visualizer-instance-id';

  return (
    <RecoilRoot>
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: workflowVisualizerComponentInstanceId,
        }}
      >
        {children}
      </WorkflowVisualizerComponentInstanceContext.Provider>
    </RecoilRoot>
  );
};

describe('useCreateStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create step in workflow version', async () => {
    const mockWorkflowVersionId = 'version-123';
    mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);

    const { result } = renderHook(() => useCreateStep(), {
      wrapper,
    });

    await act(async () => {
      await result.current.createStep({
        newStepType: 'CODE',
        parentStepId: 'parent-step-id',
        nextStepId: undefined,
      });
    });

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockCreateWorkflowVersionStep).toHaveBeenCalledWith({
      id: 'step-id',
      workflowVersionId: mockWorkflowVersionId,
      stepType: 'CODE',
      parentStepId: 'parent-step-id',
      nextStepId: undefined,
      parentStepConnectionOptions: undefined,
      position: undefined,
    });
  });
});
