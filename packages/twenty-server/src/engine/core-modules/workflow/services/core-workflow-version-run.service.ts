import { Injectable } from '@nestjs/common';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { buildWorkflowRunTriggerContext } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-trigger-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CoreWorkflowVersionRunService {
  constructor(
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  async runAsWorkspaceMember({
    workspaceId,
    workspaceCustomApplicationId,
    userWorkspaceId,
    callerApplication,
    workspaceMember,
    coreWorkflowVersionId,
    workflowRunId,
    payload,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    userWorkspaceId: string | undefined;
    callerApplication: FlatApplication | undefined;
    workspaceMember: Pick<WorkspaceMemberWorkspaceEntity, 'id' | 'name'>;
    coreWorkflowVersionId: string;
    workflowRunId?: string;
    payload?: object | null;
  }): Promise<{ workflowRunId: string }> {
    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      },
    );

    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreStartableByApplicationOrThrow(
      {
        workspaceId,
        workspaceCustomApplicationId,
        callerApplication,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      },
    );

    const { payload: triggerPayload, createdBy } =
      buildWorkflowRunTriggerContext({
        workspaceMember,
        payload,
      });

    return this.coreWorkflowRunnerService.run({
      workspaceId,
      coreWorkflowVersionId,
      workflowRunId,
      payload: triggerPayload,
      source: createdBy,
    });
  }
}
