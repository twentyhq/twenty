import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { act, renderHook } from '@testing-library/react';

const mockUpdateOneRecord = jest.fn();
const mockGetUpdatableWorkflowVersion = jest.fn();
const mockComputeStepOutputSchema = jest.fn();

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

jest.mock('@/workflow/hooks/useComputeStepOutputSchema', () => ({
  useComputeStepOutputSchema: jest.fn(() => ({
    computeStepOutputSchema: mockComputeStepOutputSchema,
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

  it('updates the trigger with computed output schema', async () => {
    mockGetUpdatableWorkflowVersion.mockResolvedValue('version-id');
    mockComputeStepOutputSchema.mockResolvedValue({
      data: { computeStepOutputSchema: { field1: 'string' } },
    });

    const { result } = renderHook(() => useUpdateWorkflowVersionTrigger());

    await act(async () => {
      await result.current.updateTrigger(trigger);
    });

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockComputeStepOutputSchema).toHaveBeenCalledWith({
      step: trigger,
      workflowVersionId: 'version-id',
    });
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: 'version-id',
      updateOneRecordInput: {
        trigger: {
          ...trigger,
          settings: { ...trigger.settings, outputSchema: { field1: 'string' } },
        },
      },
    });
  });

  it('skips output schema computation when disabled', async () => {
    mockGetUpdatableWorkflowVersion.mockResolvedValue('version-id');

    const { result } = renderHook(() => useUpdateWorkflowVersionTrigger());

    await act(async () => {
      await result.current.updateTrigger(trigger, {
        computeOutputSchema: false,
      });
    });

    expect(mockComputeStepOutputSchema).not.toHaveBeenCalled();
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: 'version-id',
      updateOneRecordInput: {
        trigger,
      },
    });
  });
});
