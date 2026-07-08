import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@RegisteredWorkspaceCommand('2.20.0', 1783513009675)
@Command({
  name: 'upgrade:2-20:backfill-workflow-version-to-core',
  description:
    'Copy each workspace workflowVersion (trigger, steps, status, workflowId) into the core workflowVersion table, preserving ids',
})
export class BackfillWorkflowVersionToCoreCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const workspaceWorkflowVersions =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowVersionRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
              workspaceId,
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          return workflowVersionRepository.find();
        },
        buildSystemAuthContext(workspaceId),
      );

    if (workspaceWorkflowVersions.length === 0) {
      return;
    }

    const coreWorkflowVersions = workspaceWorkflowVersions.map(
      (workflowVersion) => ({
        id: workflowVersion.id,
        workflowId: workflowVersion.workflowId,
        triggers: isDefined(workflowVersion.trigger)
          ? [workflowVersion.trigger]
          : null,
        steps: workflowVersion.steps ?? null,
        status: workflowVersion.status as unknown as WorkflowVersionStatus,
      }),
    );

    if (options.dryRun === true) {
      this.logger.log(
        `[DRY RUN] Would upsert ${coreWorkflowVersions.length} workflowVersion row(s) into core for workspace ${workspaceId}`,
      );

      return;
    }

    await this.coreWorkflowVersionRepository.upsert(
      workspaceId,
      coreWorkflowVersions,
      ['id'],
    );

    this.logger.log(
      `Backfilled ${coreWorkflowVersions.length} workflowVersion row(s) into core for workspace ${workspaceId}`,
    );
  }
}
