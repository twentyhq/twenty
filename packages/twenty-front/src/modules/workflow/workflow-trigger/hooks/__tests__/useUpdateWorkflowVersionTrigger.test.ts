import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { act, renderHook } from '@testing-library/react';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { vi } from 'vitest';

const mockUpdateOneRecord = vi.fn();
const mockGetUpdatableWorkflowVersion = vi.fn();
const mockMarkStepForRecomputation = vi.fn();

vi.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: vi.fn(() => ({
    updateOneRecord: mockUpdateOneRecord,
  })),
}));

vi.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: vi.fn(() => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  })),
}));

vi.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: vi.fn(() => ({
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
    vi.clearAllMocks();
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
      objectNameSingular: 'workflowVersion',
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
