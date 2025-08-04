import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { WorkflowVisualizerComponentInstanceContext } from '../../../workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useCreateStep } from '../useCreateStep';

const mockCreateDraftFromWorkflowVersion = jest.fn().mockResolvedValue('457');
const mockCreateWorkflowVersionStep = jest.fn().mockResolvedValue({
  data: {
    createWorkflowVersionStep: { createdStep: { id: '1', type: 'CODE' } },
  },
});

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

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const workflowVisualizerComponentInstanceId =
    'workflow-visualizer-instance-id';

  return (
    <RecoilRoot>
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: workflowVisualizerComponentInstanceId,
        }}
      >
        {children}
      </WorkflowVisualizerComponentInstanceContext.Provider>
    </RecoilRoot>
  );
};

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
    const { result } = renderHook(
      () =>
        useCreateStep({
          workflow: mockWorkflow as unknown as WorkflowWithCurrentVersion,
        }),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.createStep({
        newStepType: 'CODE',
        parentStepId: 'parent-step-id',
        nextStepId: undefined,
      });
    });

    expect(mockCreateWorkflowVersionStep).toHaveBeenCalled();
  });
});
