import { Command } from 'nest-commander';
import { isWorkspaceObjectNotFoundError } from 'src/database/commands/upgrade-version-command/utils/is-workspace-object-not-found-error.util';
import { LegacyWorkflowVersionCoreUpsertService } from 'src/database/commands/upgrade-version-command/utils/legacy-workflow-version-core-upsert.service';
import { type LegacyWorkflowVersionWorkspaceEntity } from 'src/database/commands/upgrade-version-command/utils/legacy-workflow-workspace-entity.type';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@RegisteredWorkspaceCommand('2.20.0', 1783526282685)
@Command({
  name: 'upgrade:2-20:backfill-workflow-version-to-core',
  description:
    'Copy each workspace workflowVersion (trigger, steps, status, workflowId) into the core workflowVersion table, preserving ids',
})
export class BackfillWorkflowVersionToCoreCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly legacyWorkflowVersionCoreUpsertService: LegacyWorkflowVersionCoreUpsertService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    let workspaceWorkflowVersions: LegacyWorkflowVersionWorkspaceEntity[];

    try {
      workspaceWorkflowVersions =
        await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
          const workflowVersionRepository =
            this.workspaceOrmManager.getRepository<LegacyWorkflowVersionWorkspaceEntity>(
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          return workflowVersionRepository.find();
        }, buildSystemAuthContext(workspaceId));
    } catch (error) {
      if (isWorkspaceObjectNotFoundError(error)) {
        this.logger.log(
          `workflowVersion object does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      throw error;
    }

    if (options.dryRun === true) {
      this.logger.log(
        `[DRY RUN] Would upsert ${workspaceWorkflowVersions.length} workflowVersion row(s) into core for workspace ${workspaceId}`,
      );

      return;
    }

    await this.legacyWorkflowVersionCoreUpsertService.upsertToCore(
      workspaceId,
      workspaceWorkflowVersions,
    );

    this.logger.log(
      `Backfilled ${workspaceWorkflowVersions.length} workflowVersion row(s) into core for workspace ${workspaceId}`,
    );
  }
}
