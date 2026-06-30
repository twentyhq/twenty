import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteTriggerVariablesToPayload } from 'src/database/commands/upgrade-version-command/2-15/utils/rewrite-trigger-variables-to-payload.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@RegisteredWorkspaceCommand('2.15.0', 1800000001000)
@Command({
  name: 'upgrade:2-15:migrate-manual-trigger-variables-to-payload',
  description:
    'Rewrite saved {{trigger.<field>}} references to {{trigger.payload.<field>}} for manual record triggers',
})
export class MigrateManualTriggerVariablesToPayloadCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
        universalIdentifier: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
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
      if (!this.isManualRecordTrigger(version.trigger)) {
        continue;
      }

      // Trigger references only appear in downstream steps, never in the
      // trigger object itself, so only the steps need rewriting.
      const migratedSteps = rewriteTriggerVariablesToPayload(version.steps);

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
        `${isDryRun ? '[DRY RUN] ' : ''}Migrated trigger variables in ${updatedVersionCount} workflow version(s) for workspace ${workspaceId}`,
      );
    }
  }

  private isManualRecordTrigger(
    trigger: WorkflowVersionWorkspaceEntity['trigger'],
  ): boolean {
    if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.MANUAL) {
      return false;
    }

    const availabilityType = trigger.settings?.availability?.type;

    return (
      availabilityType === 'SINGLE_RECORD' || availabilityType === 'BULK_RECORDS'
    );
  }
}
