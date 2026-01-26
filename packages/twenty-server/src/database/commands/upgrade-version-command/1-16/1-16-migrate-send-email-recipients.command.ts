import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import {
  type LegacySendEmailInput,
  type MigratedSendEmailInput,
  migrateSendEmailInput,
  needsSendEmailMigration,
} from 'src/database/commands/upgrade-version-command/1-16/utils/migrate-send-email-recipients.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowStep = {
  id: string;
  type: string;
  settings: {
    input: LegacySendEmailInput | MigratedSendEmailInput;
  };
};

@Command({
  name: 'upgrade:1-16:migrate-send-email-recipients',
  description:
    'Migrate send email action from legacy email field to recipients object with comma-separated strings',
})
export class MigrateSendEmailRecipientsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    MigrateSendEmailRecipientsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `Running MigrateSendEmailRecipientsCommand for workspace ${workspaceId}`,
    );

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersions = await workflowVersionRepository.find({
      select: ['id', 'steps'],
    });

    let migratedCount = 0;

    for (const version of workflowVersions) {
      const steps = version.steps as WorkflowStep[] | null;

      if (!isDefined(steps) || !Array.isArray(steps) || steps.length === 0) {
        continue;
      }

      let hasChanges = false;
      const migratedSteps = steps.map((step) => {
        if (step.type !== WorkflowActionType.SEND_EMAIL) {
          return step;
        }

        const input = step.settings.input as LegacySendEmailInput;

        if (!needsSendEmailMigration(input)) {
          return step;
        }

        hasChanges = true;
        const migratedInput = migrateSendEmailInput(input);

        return {
          ...step,
          settings: {
            ...step.settings,
            input: migratedInput,
          },
        };
      });

      if (!hasChanges) {
        continue;
      }

      migratedCount++;

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would migrate workflow version ${version.id} in workspace ${workspaceId}`,
        );
      } else {
        await workflowVersionRepository.update(
          { id: version.id },
          { steps: migratedSteps },
        );

        this.logger.log(
          `Migrated workflow version ${version.id} in workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would have migrated' : 'Migrated'} ${migratedCount} workflow version(s) in workspace ${workspaceId}`,
    );
  }
}
