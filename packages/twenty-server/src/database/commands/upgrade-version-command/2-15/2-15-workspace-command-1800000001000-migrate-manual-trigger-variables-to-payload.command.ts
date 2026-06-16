import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteTriggerVariablesToPayload } from 'src/database/commands/upgrade-version-command/2-15/utils/rewrite-trigger-variables-to-payload.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
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
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const allVersions = await workflowVersionRepository.find();

    let updatedVersionCount = 0;

    for (const version of allVersions) {
      // Only manual record triggers moved their fields under `payload`.
      // Database-event/webhook/cron triggers keep the flat schema, so their
      // {{trigger.<field>}} references must be left as-is.
      if (!this.isManualRecordTrigger(version.trigger)) {
        continue;
      }

      const migratedSteps = rewriteTriggerVariablesToPayload(version.steps);
      const migratedTrigger = rewriteTriggerVariablesToPayload(version.trigger);

      if (!migratedSteps.changed && !migratedTrigger.changed) {
        continue;
      }

      updatedVersionCount++;

      if (isDryRun) {
        continue;
      }

      await workflowVersionRepository.update(version.id, {
        ...(migratedSteps.changed ? { steps: migratedSteps.value } : {}),
        ...(migratedTrigger.changed ? { trigger: migratedTrigger.value } : {}),
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
