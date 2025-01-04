import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { renderHook } from '@testing-library/react';
import { useCreateStep } from '../useCreateStep';

const mockOpenRightDrawer = jest.fn();
const mockCreateNewWorkflowVersion = jest.fn();
const mockCreateWorkflowVersionStep = jest.fn().mockResolvedValue({
  data: { createWorkflowVersionStep: { id: '1' } },
});

jest.mock('recoil', () => ({
  useRecoilValue: () => 'parent-step-id',
  useSetRecoilState: () => jest.fn(),
  atom: (params: any) => params,
}));

jest.mock('@/ui/layout/right-drawer/hooks/useRightDrawer', () => ({
  useRightDrawer: () => ({
    openRightDrawer: mockOpenRightDrawer,
  }),
}));

jest.mock(
  '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep',
  () => ({
    useCreateWorkflowVersionStep: () => ({
      createWorkflowVersionStep: mockCreateWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useCreateNewWorkflowVersion', () => ({
  useCreateNewWorkflowVersion: () => ({
    createNewWorkflowVersion: mockCreateNewWorkflowVersion,
  }),
}));

describe('useCreateStep', () => {
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

  it('should create step in draft version', async () => {
    const { result } = renderHook(() =>
      useCreateStep({
        workflow: mockWorkflow as unknown as WorkflowWithCurrentVersion,
      }),
    );
    await result.current.createStep('CODE');

    expect(mockCreateWorkflowVersionStep).toHaveBeenCalled();
    expect(mockOpenRightDrawer).toHaveBeenCalled();
  });
});
