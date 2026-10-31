import { WorkflowActionType } from 'twenty-shared/workflow';

import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKSPACE_ID = 'workspace-id';
const CORE_WORKFLOW_VERSION_ID = 'core-workflow-version-id';

const buildAiAgentStep = (
  input: Record<string, unknown>,
  name = 'Agent',
): WorkflowAction =>
  ({
    id: 'step-id',
    name,
    type: WorkflowActionType.AI_AGENT,
    valid: true,
    nextStepIds: ['next-step-id'],
    position: { x: 10, y: 20 },
    settings: {
      input,
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: 0 },
      },
    },
  }) as WorkflowAction;

const buildService = (existingStep: WorkflowAction) => {
  const coreWorkflowVersionWriteService = {
    getValidatedDraftCoreWorkflowVersion: jest.fn().mockResolvedValue({
      coreWorkflowVersion: { id: CORE_WORKFLOW_VERSION_ID },
      trigger: null,
      steps: [existingStep],
    }),
    writeContent: jest
      .fn()
      .mockImplementation(async ({ steps }) => ({ trigger: null, steps })),
  };
  const workflowVersionStepOperationsWorkspaceService = {
    runStepCreationSideEffectsAndBuildStep: jest.fn().mockResolvedValue({
      builtStep: buildAiAgentStep({ instructions: '', prompt: '' }, 'Generate'),
    }),
    getRebuiltStepName: jest
      .fn()
      .mockImplementation(async ({ builtStep }) => builtStep.name),
    runWorkflowVersionStepDeletionSideEffects: jest.fn(),
  };

  const service = new CoreWorkflowVersionMutationWorkspaceService(
    {} as never,
    {} as never,
    coreWorkflowVersionWriteService as never,
    {} as never,
    {} as never,
    workflowVersionStepOperationsWorkspaceService as never,
  );

  return { service, workflowVersionStepOperationsWorkspaceService };
};

describe('CoreWorkflowVersionMutationWorkspaceService.updateStep', () => {
  it('rebuilds an AI step whose agent is removed, and runs the old step deletion side effects', async () => {
    const existingStep = buildAiAgentStep({
      agentId: 'hidden-agent-id',
      prompt: 'Qualify',
    });
    const { service, workflowVersionStepOperationsWorkspaceService } =
      buildService(existingStep);

    const updatedStep = await service.updateStep({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      step: buildAiAgentStep({ prompt: 'Qualify' }),
    });

    expect(
      workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        type: WorkflowActionType.AI_AGENT,
        id: existingStep.id,
        defaultSettings: expect.objectContaining({
          input: { prompt: 'Qualify' },
        }),
      }),
    );
    expect(updatedStep).toMatchObject({
      name: 'Generate',
      nextStepIds: ['next-step-id'],
      settings: { input: { instructions: '', prompt: '' } },
    });
    expect(
      workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects,
    ).toHaveBeenCalledWith({ step: existingStep, workspaceId: WORKSPACE_ID });
  });

  it('updates an AI step in place when its agent is unchanged', async () => {
    const existingStep = buildAiAgentStep({
      agentId: 'agent-id',
      prompt: 'Qualify',
    });
    const { service, workflowVersionStepOperationsWorkspaceService } =
      buildService(existingStep);
    const step = buildAiAgentStep({
      agentId: 'agent-id',
      prompt: 'Qualify the lead',
    });

    const updatedStep = await service.updateStep({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      step,
    });

    expect(updatedStep).toEqual(step);
    expect(
      workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep,
    ).not.toHaveBeenCalled();
    expect(
      workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects,
    ).not.toHaveBeenCalled();
  });
});
