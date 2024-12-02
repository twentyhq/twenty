import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { renderHook } from '@testing-library/react';
import { useDeleteStep } from '@/workflow/hooks/useDeleteStep';

const mockCloseRightDrawer = jest.fn();
const mockCreateNewWorkflowVersion = jest.fn();
const mockDeleteWorkflowVersionStep = jest.fn();
const updateOneRecordMock = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: updateOneRecordMock,
  }),
}));

jest.mock('recoil', () => ({
  useRecoilValue: () => 'parent-step-id',
  useSetRecoilState: () => jest.fn(),
  atom: (params: any) => params,
}));

jest.mock('@/ui/layout/right-drawer/hooks/useRightDrawer', () => ({
  useRightDrawer: () => ({
    closeRightDrawer: mockCloseRightDrawer,
  }),
}));

jest.mock('@/workflow/hooks/useDeleteWorkflowVersionStep', () => ({
  useDeleteWorkflowVersionStep: () => ({
    deleteWorkflowVersionStep: mockDeleteWorkflowVersionStep,
  }),
}));

jest.mock('@/workflow/hooks/useCreateNewWorkflowVersion', () => ({
  useCreateNewWorkflowVersion: () => ({
    createNewWorkflowVersion: mockCreateNewWorkflowVersion,
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
    const { result } = renderHook(() =>
      useDeleteStep({
        workflow: mockWorkflow as unknown as WorkflowWithCurrentVersion,
      }),
    );
    await result.current.deleteStep('1');

    expect(mockDeleteWorkflowVersionStep).toHaveBeenCalled();
  });
});
