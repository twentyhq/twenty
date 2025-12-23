import React from 'react';

import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

const mockDeleteWorkflowVersionStep = jest.fn();
const mockGetUpdatableWorkflowVersion = jest.fn();
const mockDeleteStepsOutputSchema = jest.fn();
const mockCloseCommandMenu = jest.fn();

jest.mock(
  '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionStep',
  () => ({
    useDeleteWorkflowVersionStep: () => ({
      deleteWorkflowVersionStep: mockDeleteWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: () => ({
    deleteStepsOutputSchema: mockDeleteStepsOutputSchema,
  }),
}));

jest.mock('@/command-menu/hooks/useCommandMenu', () => ({
  useCommandMenu: () => ({
    closeCommandMenu: mockCloseCommandMenu,
  }),
}));

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: () => undefined,
}));

jest.mock(
  '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose',
  () => ({
    useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose: () => ({
      resetPermissionState: jest.fn(),
    }),
  }),
);

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

describe('useDeleteStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete step and clean up dependencies', async () => {
    const mockWorkflowVersionId = 'version-123';
    const mockStepId = 'step-1';

    mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);
    mockDeleteWorkflowVersionStep.mockResolvedValue({
      deletedStepIds: {
        stepsDiff: [
          {
            type: 'DELETE',
            path: ['steps', 0],
            value: mockStepId,
          },
        ],
      },
    });

    const { result } = renderHook(() => useDeleteStep(), {
      wrapper,
    });
    await result.current.deleteStep(mockStepId);

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockDeleteWorkflowVersionStep).toHaveBeenCalledWith({
      workflowVersionId: mockWorkflowVersionId,
      stepId: mockStepId,
    });
    expect(mockCloseCommandMenu).toHaveBeenCalled();
    expect(mockDeleteStepsOutputSchema).toHaveBeenCalledWith({
      stepIds: [mockStepId],
      workflowVersionId: mockWorkflowVersionId,
    });
  });
});
