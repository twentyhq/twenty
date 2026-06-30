import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { act, renderHook } from '@testing-library/react';

const mockMutate = jest.fn();
const mockGetRecordFromCache = jest.fn();
const mockMarkStepForRecomputation = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ cache: {} }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: {} }),
}));

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));

jest.mock('@/object-record/cache/hooks/useGetRecordFromCache', () => ({
  useGetRecordFromCache: () => mockGetRecordFromCache,
}));

jest.mock('@/object-record/cache/utils/updateRecordFromCache', () => ({
  updateRecordFromCache: jest.fn(),
}));

jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: () => ({
    markStepForRecomputation: mockMarkStepForRecomputation,
  }),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockMutate],
}));

describe('useUpdateWorkflowVersionStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mark step for recomputation after successful update', async () => {
    const updatedStep = {
      id: 'step-1',
      name: 'My Custom Name',
      type: 'CREATE_RECORD',
    };

    mockMutate.mockResolvedValue({
      data: { updateWorkflowVersionStep: updatedStep },
    });

    mockGetRecordFromCache.mockReturnValue({
      id: 'version-1',
      steps: [{ id: 'step-1', name: 'Create Record', type: 'CREATE_RECORD' }],
    });

    const { result } = renderHook(() => useUpdateWorkflowVersionStep());

    await act(async () => {
      await result.current.updateWorkflowVersionStep({
        workflowVersionId: 'version-1',
        step: updatedStep,
      });
    });

    expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
      stepId: 'step-1',
      workflowVersionId: 'version-1',
    });
  });

  it('should not mark step for recomputation when mutation returns no data', async () => {
    mockMutate.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useUpdateWorkflowVersionStep());

    await act(async () => {
      await result.current.updateWorkflowVersionStep({
        workflowVersionId: 'version-1',
        step: { id: 'step-1', name: 'Step', type: 'CODE' },
      });
    });

    expect(mockMarkStepForRecomputation).not.toHaveBeenCalled();
  });

  it('should still mark step for recomputation when cached record is missing', async () => {
    mockMutate.mockResolvedValue({
      data: {
        updateWorkflowVersionStep: {
          id: 'step-1',
          name: 'Step',
          type: 'CODE',
        },
      },
    });

    mockGetRecordFromCache.mockReturnValue(undefined);

    const { result } = renderHook(() => useUpdateWorkflowVersionStep());

    await act(async () => {
      await result.current.updateWorkflowVersionStep({
        workflowVersionId: 'version-1',
        step: { id: 'step-1', name: 'Step', type: 'CODE' },
      });
    });

    expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
      stepId: 'step-1',
      workflowVersionId: 'version-1',
    });
  });
});
