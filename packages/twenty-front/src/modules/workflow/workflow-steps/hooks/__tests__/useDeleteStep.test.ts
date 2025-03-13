import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

const mockDeleteWorkflowVersionStep = jest.fn();
const updateOneRecordMock = jest.fn();
const mockCreateDraftFromWorkflowVersion = jest.fn().mockResolvedValue('457');

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: updateOneRecordMock,
  }),
}));

jest.mock('@/workflow/hooks/useDeleteWorkflowVersionStep', () => ({
  useDeleteWorkflowVersionStep: () => ({
    deleteWorkflowVersionStep: mockDeleteWorkflowVersionStep,
  }),
}));

jest.mock('@/workflow/hooks/useCreateDraftFromWorkflowVersion', () => ({
  useCreateDraftFromWorkflowVersion: () => ({
    createDraftFromWorkflowVersion: mockCreateDraftFromWorkflowVersion,
  }),
}));

describe('useDeleteStep', () => {
  const mockWorkflow = {
    id: '123',
    currentVersion: {
      id: '456',
      status: 'DRAFT',
      steps: [],
      trigger: { type: 'manual' },
    },
    versions: [],
  };

  it('should delete step in draft version', async () => {
    const { result } = renderHook(
      () =>
        useDeleteStep({
          workflow: mockWorkflow as unknown as WorkflowWithCurrentVersion,
        }),
      { wrapper: RecoilRoot },
    );
    await result.current.deleteStep('1');

    expect(mockDeleteWorkflowVersionStep).toHaveBeenCalled();
  });
});
