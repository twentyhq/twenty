import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

const UPSERT_CHUNK_SIZE = 100;

@RegisteredWorkspaceCommand('2.14.0', 1781700000000)
@Command({
  name: 'upgrade:2-14:backfill-workflow-versions-to-core',
  description:
    'Copy workspace workflowVersion rows into the core WorkflowVersionEntity, preserving id (idempotent). --dry-run reports drift.',
})
export class BackfillWorkflowVersionsToCoreCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
    const isDryRun = options.dryRun ?? false;

    const workspaceWorkflowVersions =
      await this.readWorkspaceWorkflowVersions(workspaceId);

    if (workspaceWorkflowVersions.length === 0) {
      this.logger.log(`No workflowVersion rows for workspace ${workspaceId}`);

      return;
    }

    if (isDryRun) {
      const alreadyInCore = await this.coreWorkflowVersionRepository.count(
        workspaceId,
        { withDeleted: true },
      );

      this.logger.log(
        `[DRY RUN] workspace ${workspaceId}: ${workspaceWorkflowVersions.length} workspace versions, ${alreadyInCore} already in core`,
      );

      return;
    }

    const entities = workspaceWorkflowVersions.map((record) => ({
      id: record.id,
      workflowId: record.workflowId,
      name: record.name ?? null,
      status: record.status as unknown as CoreWorkflowVersionStatus,
      position: record.position ?? 0,
      trigger: record.trigger ?? null,
      steps: record.steps ?? null,
      deletedAt: isDefined(record.deletedAt) ? new Date(record.deletedAt) : null,
    }));

    for (let index = 0; index < entities.length; index += UPSERT_CHUNK_SIZE) {
      await this.coreWorkflowVersionRepository.upsert(
        workspaceId,
        entities.slice(index, index + UPSERT_CHUNK_SIZE),
        ['id'],
      );
    }

    this.logger.log(
      `Backfilled ${entities.length} workflow versions into core for workspace ${workspaceId}`,
    );
  }

  private async readWorkspaceWorkflowVersions(
    workspaceId: string,
  ): Promise<WorkflowVersionWorkspaceEntity[]> {
    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
      );

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      () => workflowVersionRepository.find({ withDeleted: true }),
      authContext,
    );
  }
}
