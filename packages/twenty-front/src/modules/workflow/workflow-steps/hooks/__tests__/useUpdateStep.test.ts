import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { renderHook } from '@testing-library/react';

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

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersion', () => ({
  useGetUpdatableWorkflowVersion: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

describe('useUpdateStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update step in workflow version', async () => {
    const mockWorkflowVersionId = 'version-123';
    const mockStep = {
      id: '1',
      name: 'name',
      valid: true,
      type: 'CODE' as const,
      settings: {
        input: {
          serverlessFunctionId: 'id',
          serverlessFunctionVersion: '1',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: {
            value: true,
          },
          continueOnFailure: {
            value: true,
          },
        },
      },
    };

    mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);

    const { result } = renderHook(() => useUpdateStep());
    await result.current.updateStep(mockStep);

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledWith({
      workflowVersionId: mockWorkflowVersionId,
      step: mockStep,
    });
  });

  it('should throw error when workflow version is not found', async () => {
    mockGetUpdatableWorkflowVersion.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateStep());

    await expect(
      result.current.updateStep({
        id: '1',
        name: 'test',
        valid: true,
        type: 'CODE' as const,
        settings: {
          input: {
            serverlessFunctionId: 'test',
            serverlessFunctionVersion: '1',
            serverlessFunctionInput: {},
          },
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        },
      }),
    ).rejects.toThrow('Workflow version not found');
  });
});
