import { Injectable } from '@nestjs/common';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { buildWorkflowRunTriggerContext } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-trigger-context.util';

@Injectable()
export class CoreWorkflowVersionRunService {
  constructor(
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  async run({
    authContext,
    coreWorkflowVersionId,
    workflowRunId,
    payload,
  }: {
    authContext: UserWorkspaceAuthContext;
    coreWorkflowVersionId: string;
    workflowRunId?: string;
    payload?: object | null;
  }): Promise<{ workflowRunId: string }> {
    const { workspace, userWorkspaceId, application, workspaceMember } =
      authContext;

    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId: workspace.id,
        userWorkspaceId,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      },
    );

    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreStartableByApplicationOrThrow(
      {
        workspaceId: workspace.id,
        workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
        callerApplication: application,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      },
    );

    const { payload: triggerPayload, createdBy } =
      buildWorkflowRunTriggerContext({
        workspaceMember,
        payload,
      });

    return this.coreWorkflowRunnerService.run({
      workspaceId: workspace.id,
      coreWorkflowVersionId,
      workflowRunId,
      payload: triggerPayload,
      source: createdBy,
    });
  }
}
