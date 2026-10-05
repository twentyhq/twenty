import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteIsNotNullFilterOperands } from 'src/database/commands/upgrade-version-command/2-36/utils/rewrite-is-not-null-filter-operands.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@RegisteredWorkspaceCommand('2.36.0', 1787700000000)
@Command({
  name: 'upgrade:2-36:rewrite-is-not-null-workflow-filter-operands',
  description:
    'Rewrite the legacy IS_NOT_NULL filter operand to IS_NOT_EMPTY in workflow if-else/filter steps and database-event trigger filters, which otherwise throws at runtime',
})
export class RewriteIsNotNullWorkflowFilterOperandsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    await this.rewriteWorkflowVersions({
      workspaceId,
      flatObjectMetadataMaps,
      isDryRun,
    });

    await this.rewriteAutomatedTriggers({
      workspaceId,
      flatObjectMetadataMaps,
      isDryRun,
    });
  }

  private async rewriteWorkflowVersions({
    workspaceId,
    flatObjectMetadataMaps,
    isDryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: UniversalFlatEntityMaps<FlatObjectMetadata>;
    isDryRun: boolean;
  }): Promise<void> {
    const workflowVersionObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    if (!isDefined(workflowVersionObject)) {
      return;
    }

    const workflowVersionRepository =
      await this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const allVersions = await workflowVersionRepository.find();

    let updatedCount = 0;

    for (const version of allVersions) {
      const migratedSteps = rewriteIsNotNullFilterOperands(version.steps);
      const migratedTrigger = rewriteIsNotNullFilterOperands(version.trigger);

      if (!migratedSteps.changed && !migratedTrigger.changed) {
        continue;
      }

      updatedCount++;

      if (isDryRun) {
        continue;
      }

      await workflowVersionRepository.update(version.id, {
        ...(migratedSteps.changed ? { steps: migratedSteps.value } : {}),
        ...(migratedTrigger.changed ? { trigger: migratedTrigger.value } : {}),
      });
    }

    if (updatedCount > 0) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Rewrote IS_NOT_NULL operands in ${updatedCount} workflow version(s) for workspace ${workspaceId}`,
      );
    }
  }

  private async rewriteAutomatedTriggers({
    workspaceId,
    flatObjectMetadataMaps,
    isDryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: UniversalFlatEntityMaps<FlatObjectMetadata>;
    isDryRun: boolean;
  }): Promise<void> {
    const automatedTriggerObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
      });

    if (!isDefined(automatedTriggerObject)) {
      return;
    }

    const automatedTriggerRepository =
      await this.workspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        'workflowAutomatedTrigger',
        { shouldBypassPermissionChecks: true },
      );

    const allTriggers = await automatedTriggerRepository.find();

    let updatedCount = 0;

    for (const trigger of allTriggers) {
      const migratedSettings = rewriteIsNotNullFilterOperands(trigger.settings);

      if (!migratedSettings.changed) {
        continue;
      }

      updatedCount++;

      if (isDryRun) {
        continue;
      }

      await automatedTriggerRepository.update(trigger.id, {
        settings: migratedSettings.value,
      });
    }

    if (updatedCount === 0) {
      return;
    }

    if (!isDryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Rewrote IS_NOT_NULL operands in ${updatedCount} automated trigger(s) for workspace ${workspaceId}`,
    );
  }
}
