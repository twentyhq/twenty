import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { renderHook } from '@testing-library/react';

const mockUpdateWorkflowVersionStep = jest.fn();
const mockCreateDraftFromWorkflowVersion = jest.fn().mockResolvedValue({
  id: '457',
  name: 'toto',
  createdAt: '2024-07-03T20:03:35.064Z',
  updatedAt: '2024-07-03T20:03:35.064Z',
  workflowId: '123',
  __typename: 'WorkflowVersion',
  status: 'DRAFT',
  steps: [],
  trigger: null,
});

jest.mock('recoil', () => ({
  useRecoilValue: () => 'parent-step-id',
  useSetRecoilState: () => jest.fn(),
  atom: (params: any) => params,
}));

jest.mock(
  '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep',
  () => ({
    useUpdateWorkflowVersionStep: () => ({
      updateWorkflowVersionStep: mockUpdateWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useCreateDraftFromWorkflowVersion', () => ({
  useCreateDraftFromWorkflowVersion: () => ({
    createDraftFromWorkflowVersion: mockCreateDraftFromWorkflowVersion,
  }),
}));

describe('useUpdateStep', () => {
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

  it('should update step in draft version', async () => {
    const { result } = renderHook(() =>
      useUpdateStep({
        workflow: mockWorkflow as unknown as WorkflowWithCurrentVersion,
      }),
    );
    await result.current.updateStep({
      id: '1',
      name: 'name',
      valid: true,
      type: 'CODE',
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
    });

    expect(mockUpdateWorkflowVersionStep).toHaveBeenCalled();
  });
});
