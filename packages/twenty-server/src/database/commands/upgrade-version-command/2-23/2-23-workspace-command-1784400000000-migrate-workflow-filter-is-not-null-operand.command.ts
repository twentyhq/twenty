import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteWorkflowFilterIsNotNullOperand } from 'src/database/commands/upgrade-version-command/2-23/utils/rewrite-workflow-filter-is-not-null-operand.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@RegisteredWorkspaceCommand('2.23.0', 1784400000000)
@Command({
  name: 'upgrade:2-23:migrate-workflow-filter-is-not-null-operand',
  description:
    'Rewrite legacy isNotNull/IS_NOT_NULL workflow filter operands to IS_NOT_EMPTY',
})
export class MigrateWorkflowFilterIsNotNullOperandCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    // Empty/partially-provisioned workspaces have no workflowVersion object;
    // fetching the repository for a missing entity throws, so skip them.
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const workflowVersionObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    if (!isDefined(workflowVersionObject)) {
      this.logger.log(
        `workflowVersion object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const allVersions = await workflowVersionRepository.find();

    let updatedVersionCount = 0;

    for (const version of allVersions) {
      const migratedSteps = rewriteWorkflowFilterIsNotNullOperand(version.steps);

      if (!migratedSteps.changed) {
        continue;
      }

      updatedVersionCount++;

      if (isDryRun) {
        continue;
      }

      await workflowVersionRepository.update(version.id, {
        steps: migratedSteps.value,
      });
    }

    if (updatedVersionCount > 0) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Migrated isNotNull filter operands in ${updatedVersionCount} workflow version(s) for workspace ${workspaceId}`,
      );
    }
  }
}
