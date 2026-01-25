import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { vi } from 'vitest';

const mockGetUpdatableWorkflowVersion = vi.fn();
const mockDuplicateWorkflowVersionStep = vi.fn().mockResolvedValue({
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

vi.mock(
  '@/workflow/workflow-steps/hooks/useDuplicateWorkflowVersionStep',
  () => ({
    useDuplicateWorkflowVersionStep: () => ({
      duplicateWorkflowVersionStep: mockDuplicateWorkflowVersionStep,
    }),
  }),
);

vi.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
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
    vi.clearAllMocks();
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
