import {
  WORKFLOW_TRIGGER_METADATA_KEY,
  WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY,
  WORKFLOW_TRIGGER_PAYLOAD_KEY,
} from 'twenty-shared/workflow';

import { type CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { CoreWorkflowVersionRunService } from 'src/engine/core-modules/workflow/services/core-workflow-version-run.service';
import { type CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';

const WORKSPACE_ID = 'workspace-id';
const CUSTOM_APPLICATION_ID = 'custom-application-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const CORE_WORKFLOW_VERSION_ID = 'core-workflow-version-id';
const WORKSPACE_MEMBER = {
  id: 'workspace-member-id',
  name: { firstName: 'Ada', lastName: 'Lovelace' },
};

const buildService = ({
  assertAccessible = jest.fn().mockResolvedValue(undefined),
}: {
  assertAccessible?: jest.Mock;
} = {}) => {
  const coreWorkflowRunnerService = {
    run: jest.fn().mockResolvedValue({ workflowRunId: 'workflow-run-id' }),
  };
  const coreWorkflowAccessService = {
    assertCoreWorkflowVersionsAreAccessibleOrThrow: assertAccessible,
    assertCoreWorkflowVersionsAreStartableByApplicationOrThrow: jest
      .fn()
      .mockResolvedValue(undefined),
  };

  const service = new CoreWorkflowVersionRunService(
    coreWorkflowRunnerService as unknown as CoreWorkflowRunnerService,
    coreWorkflowAccessService as unknown as CoreWorkflowAccessService,
  );

  return { service, coreWorkflowRunnerService, coreWorkflowAccessService };
};

const RUN_INPUT = {
  workspaceId: WORKSPACE_ID,
  workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
  userWorkspaceId: USER_WORKSPACE_ID,
  callerApplication: undefined,
  workspaceMember: WORKSPACE_MEMBER,
  coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
  payload: { properties: { after: { name: 'Acme' } } },
};

describe('CoreWorkflowVersionRunService', () => {
  it('should run the version with the trigger payload and the member as source', async () => {
    const { service, coreWorkflowRunnerService } = buildService();

    const result = await service.runAsWorkspaceMember(RUN_INPUT);

    expect(result).toEqual({ workflowRunId: 'workflow-run-id' });
    expect(coreWorkflowRunnerService.run).toHaveBeenCalledTimes(1);
    expect(coreWorkflowRunnerService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
        payload: expect.objectContaining({
          properties: { after: { name: 'Acme' } },
          [WORKFLOW_TRIGGER_PAYLOAD_KEY]: {
            properties: { after: { name: 'Acme' } },
          },
          [WORKFLOW_TRIGGER_METADATA_KEY]: {
            [WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY]:
              WORKSPACE_MEMBER.id,
          },
        }),
        source: expect.objectContaining({
          workspaceMemberId: WORKSPACE_MEMBER.id,
        }),
      }),
    );
  });

  it('should check that the caller may run the version', async () => {
    const { service, coreWorkflowAccessService } = buildService();

    await service.runAsWorkspaceMember(RUN_INPUT);

    expect(
      coreWorkflowAccessService.assertCoreWorkflowVersionsAreAccessibleOrThrow,
    ).toHaveBeenCalledTimes(1);
    expect(
      coreWorkflowAccessService.assertCoreWorkflowVersionsAreAccessibleOrThrow,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      coreWorkflowVersionIds: [CORE_WORKFLOW_VERSION_ID],
    });
    expect(
      coreWorkflowAccessService.assertCoreWorkflowVersionsAreStartableByApplicationOrThrow,
    ).toHaveBeenCalledTimes(1);
    expect(
      coreWorkflowAccessService.assertCoreWorkflowVersionsAreStartableByApplicationOrThrow,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      callerApplication: undefined,
      coreWorkflowVersionIds: [CORE_WORKFLOW_VERSION_ID],
    });
  });

  it('should not run a version the caller cannot access', async () => {
    const { service, coreWorkflowRunnerService } = buildService({
      assertAccessible: jest
        .fn()
        .mockRejectedValue(new Error('Workflow version not found')),
    });

    await expect(service.runAsWorkspaceMember(RUN_INPUT)).rejects.toThrow(
      'Workflow version not found',
    );
    expect(coreWorkflowRunnerService.run).not.toHaveBeenCalled();
  });
});
