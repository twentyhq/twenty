import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

const mockGetUpdatableWorkflowVersion = jest.fn();
const mockDuplicateWorkflowVersionStep = jest.fn().mockResolvedValue({
  data: {
    duplicateWorkflowVersionStep: {
      stepsDiff: [
        {
          type: 'CREATE',
          path: ['steps', 0],
          value: { id: '2', type: 'CODE' },
        },
      ],
    },
  },
});

jest.mock(
  '@/workflow/workflow-steps/hooks/useDuplicateWorkflowVersionStep',
  () => ({
    useDuplicateWorkflowVersionStep: () => ({
      duplicateWorkflowVersionStep: mockDuplicateWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

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

describe('useDuplicateStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create step in workflow version', async () => {
    const mockWorkflowVersionId = 'version-123';
    mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);

    const { result } = renderHook(() => useDuplicateStep(), {
      wrapper,
    });

    await act(async () => {
      await result.current.duplicateStep({
        stepId: 'step-1',
      });
    });

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockDuplicateWorkflowVersionStep).toHaveBeenCalledWith({
      stepId: 'step-1',
      workflowVersionId: mockWorkflowVersionId,
    });
  });
});
