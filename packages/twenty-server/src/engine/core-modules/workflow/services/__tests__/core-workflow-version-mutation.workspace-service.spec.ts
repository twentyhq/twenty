import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKSPACE_ID = 'workspace-id';
const CORE_WORKFLOW_VERSION_ID = 'core-workflow-version-id';

const buildAiAgentStep = ({
  input,
  name = 'Agent',
}: {
  input: WorkflowAiAgentAction['settings']['input'];
  name?: string;
}): WorkflowAiAgentAction => ({
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
});

const buildService = async ({
  existingStep,
}: {
  existingStep: WorkflowAiAgentAction;
}) => {
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
      builtStep: buildAiAgentStep({
        input: { instructions: '', prompt: '' },
        name: 'Generate',
      }),
    }),
    getStepAfterRebuild: jest
      .fn()
      .mockImplementation(async ({ builtStep }) => builtStep),
    runWorkflowVersionStepDeletionSideEffects: jest.fn(),
  };

  const testingModule = await Test.createTestingModule({
    providers: [
      CoreWorkflowVersionMutationWorkspaceService,
      {
        provide: getWorkspaceScopedRepositoryToken(WorkflowVersionEntity),
        useValue: {},
      },
      { provide: CoreWorkflowIdResolutionService, useValue: {} },
      {
        provide: CoreWorkflowVersionWriteService,
        useValue: coreWorkflowVersionWriteService,
      },
      { provide: CoreWorkflowVersionListService, useValue: {} },
      { provide: WorkflowCoreSyncService, useValue: {} },
      {
        provide: WorkflowVersionStepOperationsWorkspaceService,
        useValue: workflowVersionStepOperationsWorkspaceService,
      },
      { provide: CacheLockService, useValue: {} },
    ],
  }).compile();

  return {
    service: testingModule.get(CoreWorkflowVersionMutationWorkspaceService),
    coreWorkflowVersionWriteService,
    workflowVersionStepOperationsWorkspaceService,
  };
};

// a step running a hidden agent can no longer be created through the API, so only a unit test reaches this case
describe('CoreWorkflowVersionMutationWorkspaceService.updateStep', () => {
  it('rebuilds an AI step whose agent is removed, and runs the old step deletion side effects', async () => {
    const existingStep = buildAiAgentStep({
      input: { agentId: 'hidden-agent-id', prompt: 'Qualify' },
    });
    const {
      service,
      coreWorkflowVersionWriteService,
      workflowVersionStepOperationsWorkspaceService,
    } = await buildService({ existingStep });

    const updatedStep = await service.updateStep({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      step: buildAiAgentStep({ input: { prompt: 'Qualify' } }),
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
    expect(coreWorkflowVersionWriteService.writeContent).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      expectedVersion: { id: CORE_WORKFLOW_VERSION_ID },
      trigger: null,
      steps: [updatedStep],
    });
    expect(
      workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects,
    ).toHaveBeenCalledWith({ step: existingStep, workspaceId: WORKSPACE_ID });
  });

  it('updates an AI step in place when its agent is unchanged', async () => {
    const existingStep = buildAiAgentStep({
      input: { agentId: 'agent-id', prompt: 'Qualify' },
    });
    const {
      service,
      coreWorkflowVersionWriteService,
      workflowVersionStepOperationsWorkspaceService,
    } = await buildService({ existingStep });
    const step = buildAiAgentStep({
      input: { agentId: 'agent-id', prompt: 'Qualify the lead' },
    });

    const updatedStep = await service.updateStep({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      step,
    });

    expect(updatedStep).toEqual(step);
    expect(coreWorkflowVersionWriteService.writeContent).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      expectedVersion: { id: CORE_WORKFLOW_VERSION_ID },
      trigger: null,
      steps: [step],
    });
    expect(
      workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep,
    ).not.toHaveBeenCalled();
    expect(
      workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects,
    ).not.toHaveBeenCalled();
  });
});
