import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { act, renderHook } from '@testing-library/react';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const mockMutate = jest.fn();
const mockGetUpdatableWorkflowVersion = jest.fn();
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

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: jest.fn(() => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  })),
}));

jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: jest.fn(() => ({
    markStepForRecomputation: mockMarkStepForRecomputation,
  })),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockMutate],
}));

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
    mockGetRecordFromCache.mockReturnValue(undefined);
  });

  it('updates the trigger via the dedicated mutation and marks it for recomputation', async () => {
    mockGetUpdatableWorkflowVersion.mockResolvedValue('version-id');

    const { result } = renderHook(() => useUpdateWorkflowVersionTrigger());

    await act(async () => {
      await result.current.updateTrigger(trigger);
    });

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            workflowVersionId: 'version-id',
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
    const triggerTypes = ['DATABASE_EVENT', 'MANUAL', 'CRON', 'WEBHOOK'];

    for (const triggerType of triggerTypes) {
      mockMarkStepForRecomputation.mockClear();
      mockGetUpdatableWorkflowVersion.mockResolvedValue('version-id');

      const testTrigger = {
        name: `${triggerType} Trigger`,
        type: triggerType,
        settings: {
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowTrigger;

      const { result } = renderHook(() => useUpdateWorkflowVersionTrigger());

      await act(async () => {
        await result.current.updateTrigger(testTrigger);
      });

      expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
        stepId: TRIGGER_STEP_ID,
        workflowVersionId: 'version-id',
      });
    }
  });
});
