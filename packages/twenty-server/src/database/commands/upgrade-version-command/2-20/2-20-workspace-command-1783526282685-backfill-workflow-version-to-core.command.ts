import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { isWorkspaceObjectNotFoundError } from 'src/database/commands/upgrade-version-command/utils/is-workspace-object-not-found-error.util';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type LegacyWorkflowVersionWorkspaceEntity } from 'src/database/commands/upgrade-version-command/2-20/types/legacy-workflow-version-workspace-entity.type';
import { upsertLegacyWorkflowVersionsToCore } from 'src/database/commands/upgrade-version-command/2-20/utils/upsert-legacy-workflow-versions-to-core.util';

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
    private readonly applicationService: ApplicationService,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
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
        await this.workspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const workflowVersionRepository =
              this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<LegacyWorkflowVersionWorkspaceEntity>('workflowVersion');

            return workflowVersionRepository.find();
          },
          buildSystemAuthContext(workspaceId),
        );
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

    await upsertLegacyWorkflowVersionsToCore({
      workspaceId,
      workflowVersions: workspaceWorkflowVersions,
      dependencies: {
        applicationService: this.applicationService,
        coreWorkflowVersionRepository: this.coreWorkflowVersionRepository,
        flatEntityMapsCacheService: this.flatEntityMapsCacheService,
        logger: this.logger,
        workspaceCacheService: this.workspaceCacheService,
        workspaceMigrationValidateBuildAndRunService:
          this.workspaceMigrationValidateBuildAndRunService,
        workspaceOrmManager: this.workspaceOrmManager,
        workspaceRepository: this.workspaceRepository,
      },
    });

    this.logger.log(
      `Backfilled ${workspaceWorkflowVersions.length} workflowVersion row(s) into core for workspace ${workspaceId}`,
    );
  }
}
