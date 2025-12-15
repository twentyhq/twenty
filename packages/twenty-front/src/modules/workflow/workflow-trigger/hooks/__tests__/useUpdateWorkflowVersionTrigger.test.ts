import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { act, renderHook } from '@testing-library/react';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const mockUpdateOneRecord = jest.fn();
const mockGetUpdatableWorkflowVersion = jest.fn();
const mockMarkStepForRecomputation = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: jest.fn(() => ({
    updateOneRecord: mockUpdateOneRecord,
  })),
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
  });

  it('updates the trigger and marks it for recomputation for frontend-computed types', async () => {
    mockGetUpdatableWorkflowVersion.mockResolvedValue('version-id');

    const { result } = renderHook(() => useUpdateWorkflowVersionTrigger());

    await act(async () => {
      await result.current.updateTrigger(trigger);
    });

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
      stepId: TRIGGER_STEP_ID,
      workflowVersionId: 'version-id',
    });
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: 'version-id',
      updateOneRecordInput: {
        trigger,
      },
    });
  });

  it('marks for recomputation for all trigger types', async () => {
    const triggerTypes = ['DATABASE_EVENT', 'MANUAL', 'CRON', 'WEBHOOK'];

    for (const triggerType of triggerTypes) {
      mockMarkStepForRecomputation.mockClear();
      mockGetUpdatableWorkflowVersion.mockResolvedValue('version-id');

      const testTrigger: WorkflowTrigger = {
        name: `${triggerType} Trigger`,
        type: triggerType as any,
        settings: {
          outputSchema: {},
        },
        nextStepIds: [],
      };

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
