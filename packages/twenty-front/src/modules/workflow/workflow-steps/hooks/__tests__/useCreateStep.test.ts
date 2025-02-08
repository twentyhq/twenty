import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { renderHook } from '@testing-library/react';
import { useCreateStep } from '../useCreateStep';

const mockCreateDraftFromWorkflowVersion = jest.fn().mockResolvedValue('457');
const mockCreateWorkflowVersionStep = jest.fn().mockResolvedValue({
  data: { createWorkflowVersionStep: { id: '1', type: 'CODE' } },
});

jest.mock('recoil', () => ({
  useRecoilValue: () => 'parent-step-id',
  useSetRecoilState: () => jest.fn(),
  atom: (params: any) => params,
}));

jest.mock(
  '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep',
  () => ({
    useCreateWorkflowVersionStep: () => ({
      createWorkflowVersionStep: mockCreateWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useCreateDraftFromWorkflowVersion', () => ({
  useCreateDraftFromWorkflowVersion: () => ({
    createDraftFromWorkflowVersion: mockCreateDraftFromWorkflowVersion,
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
  });
});
