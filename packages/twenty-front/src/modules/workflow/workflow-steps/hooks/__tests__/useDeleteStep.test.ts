import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { renderHook } from '@testing-library/react';

const mockDeleteWorkflowVersionStep = jest.fn();
const mockGetUpdatableWorkflowVersion = jest.fn();
const mockDeleteStepsOutputSchema = jest.fn();
const mockCloseCommandMenu = jest.fn();

jest.mock(
  '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionStep',
  () => ({
    useDeleteWorkflowVersionStep: () => ({
      deleteWorkflowVersionStep: mockDeleteWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

jest.mock('@/workflow/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: () => ({
    deleteStepsOutputSchema: mockDeleteStepsOutputSchema,
  }),
}));

jest.mock('@/command-menu/hooks/useCommandMenu', () => ({
  useCommandMenu: () => ({
    closeCommandMenu: mockCloseCommandMenu,
  }),
}));

describe('useDeleteStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete step and clean up dependencies', async () => {
    const mockWorkflowVersionId = 'version-123';
    const mockStepId = 'step-1';
    const mockDeletedStepIds = ['step-1', 'step-2'];

    mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);
    mockDeleteWorkflowVersionStep.mockResolvedValue({
      deletedStepIds: mockDeletedStepIds,
    });

    const { result } = renderHook(() => useDeleteStep());
    await result.current.deleteStep(mockStepId);

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockDeleteWorkflowVersionStep).toHaveBeenCalledWith({
      workflowVersionId: mockWorkflowVersionId,
      stepId: mockStepId,
    });
    expect(mockCloseCommandMenu).toHaveBeenCalled();
    expect(mockDeleteStepsOutputSchema).toHaveBeenCalledWith({
      stepIds: mockDeletedStepIds,
      workflowVersionId: mockWorkflowVersionId,
    });
  });
});
