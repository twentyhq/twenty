import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { act, renderHook } from '@testing-library/react';
import { type WorkflowAction } from '~/generated/graphql';

const mockUpdateWorkflowVersionStep = jest.fn();
const mockGetUpdatableWorkflowVersion = jest.fn();
const mockMarkStepForRecomputation = jest.fn();

jest.mock(
  '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep',
  () => ({
    useUpdateWorkflowVersionStep: () => ({
      updateWorkflowVersionStep: mockUpdateWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: jest.fn(() => ({
    markStepForRecomputation: mockMarkStepForRecomputation,
  })),
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
    await act(async () => {
      await result.current.updateStep(mockStep);
    });

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalledWith({
      workflowVersionId: mockWorkflowVersionId,
      step: mockStep,
    });
  });

  it('should mark step for recomputation after update', async () => {
    const mockWorkflowVersionId = 'version-123';
    const mockStep = {
      id: 'step-1',
      name: 'Create Record',
      valid: true,
      type: 'CREATE_RECORD' as const,
      settings: {
        input: {
          objectName: 'company',
        },
        errorHandlingOptions: {
          retryOnFailure: { value: false },
          continueOnFailure: { value: false },
        },
      },
    };

    mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);

    const { result } = renderHook(() => useUpdateStep());
    await act(async () => {
      await result.current.updateStep(mockStep as WorkflowAction);
    });

    expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
      stepId: 'step-1',
      workflowVersionId: mockWorkflowVersionId,
    });
  });

  it('should mark step for recomputation for all step types', async () => {
    const mockWorkflowVersionId = 'version-123';
    const stepTypes = ['CODE', 'HTTP_REQUEST', 'CREATE_RECORD', 'SEND_EMAIL'];

    for (const stepType of stepTypes) {
      mockMarkStepForRecomputation.mockClear();
      mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);

      const mockStep = {
        id: `step-${stepType}`,
        name: `${stepType} Step`,
        valid: true,
        type: stepType as any,
        settings: {
          input: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        },
      };

      const { result } = renderHook(() => useUpdateStep());
      await act(async () => {
        await result.current.updateStep(mockStep as WorkflowAction);
      });

      expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
        stepId: `step-${stepType}`,
        workflowVersionId: mockWorkflowVersionId,
      });
    }
  });
});
