import { WorkflowActionType } from 'twenty-shared/workflow';

import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { CoreWorkflowVersionPostCommitError } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const workspaceId = '20202020-0000-0000-0000-000000000001';
const coreWorkflowVersionId = '20202020-0000-0000-0000-000000000002';
const stepId = '20202020-0000-0000-0000-000000000003';

const existingCodeStep = {
  id: stepId,
  name: 'Code',
  type: WorkflowActionType.CODE,
  valid: true,
  settings: {
    input: {
      logicFunctionId: '20202020-0000-0000-0000-000000000004',
      logicFunctionInput: {},
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds: [],
} as WorkflowAction;

const replacementEmptyStep = {
  id: '20202020-0000-0000-0000-000000000005',
  name: 'Empty',
  type: WorkflowActionType.EMPTY,
  valid: true,
  settings: {
    input: {},
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds: [],
} as WorkflowAction;

describe('CoreWorkflowVersionMutationWorkspaceService', () => {
  const getValidatedDraftCoreWorkflowVersion = jest.fn();
  const writeContentAndMirror = jest.fn();
  const runStepCreationSideEffectsAndBuildStep = jest.fn();
  const runWorkflowVersionStepDeletionSideEffects = jest.fn();
  const enrichOutputSchema = jest.fn();

  const service = new CoreWorkflowVersionMutationWorkspaceService(
    {} as never,
    {} as never,
    {
      getValidatedDraftCoreWorkflowVersion,
      writeContentAndMirror,
    } as never,
    {} as never,
    {} as never,
    {
      runStepCreationSideEffectsAndBuildStep,
      runWorkflowVersionStepDeletionSideEffects,
    } as never,
    { enrichOutputSchema } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    getValidatedDraftCoreWorkflowVersion.mockResolvedValue({
      coreWorkflowVersion: {
        triggers: [],
        steps: [existingCodeStep],
      },
      trigger: null,
      steps: [existingCodeStep],
    });
    runStepCreationSideEffectsAndBuildStep.mockResolvedValue({
      builtStep: replacementEmptyStep,
    });
    enrichOutputSchema.mockImplementation(
      async ({ step }: { step: WorkflowAction }) => step,
    );
    runWorkflowVersionStepDeletionSideEffects.mockResolvedValue(undefined);
  });

  it('keeps the existing step resource when the optimistic write is rejected', async () => {
    const writeError = new Error('Workflow version changed');

    writeContentAndMirror.mockRejectedValue(writeError);

    await expect(
      service.updateStep({
        workspaceId,
        coreWorkflowVersionId,
        step: { ...replacementEmptyStep, id: stepId },
      }),
    ).rejects.toBe(writeError);

    expect(runWorkflowVersionStepDeletionSideEffects).not.toHaveBeenCalledWith({
      step: existingCodeStep,
      workspaceId,
    });
    expect(runWorkflowVersionStepDeletionSideEffects).toHaveBeenCalledWith({
      step: expect.objectContaining({ type: WorkflowActionType.EMPTY }),
      workspaceId,
    });
  });

  it('deletes the existing step resource only after the replacement is stored', async () => {
    writeContentAndMirror.mockResolvedValue(undefined);

    await service.updateStep({
      workspaceId,
      coreWorkflowVersionId,
      step: { ...replacementEmptyStep, id: stepId },
    });

    expect(runWorkflowVersionStepDeletionSideEffects).toHaveBeenCalledWith({
      step: existingCodeStep,
      workspaceId,
    });
    expect(writeContentAndMirror.mock.invocationCallOrder[0]).toBeLessThan(
      runWorkflowVersionStepDeletionSideEffects.mock.invocationCallOrder[0],
    );
  });

  it('keeps the committed replacement and deletes the old resource when cache invalidation fails', async () => {
    const cacheError = new CoreWorkflowVersionPostCommitError(
      new Error('Cache unavailable'),
    );

    writeContentAndMirror.mockRejectedValue(cacheError);

    await expect(
      service.updateStep({
        workspaceId,
        coreWorkflowVersionId,
        step: { ...replacementEmptyStep, id: stepId },
      }),
    ).rejects.toBe(cacheError);

    expect(runWorkflowVersionStepDeletionSideEffects).toHaveBeenCalledTimes(1);
    expect(runWorkflowVersionStepDeletionSideEffects).toHaveBeenCalledWith({
      step: existingCodeStep,
      workspaceId,
    });
  });
});
