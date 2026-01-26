import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type LegacySendEmailInput = {
  connectedAccountId: string;
  email?: string;
  recipients?: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
  };
  subject?: string;
  body?: string;
  files?: unknown[];
};

type MigratedSendEmailInput = {
  connectedAccountId: string;
  recipients: {
    to: string;
    cc: string;
    bcc: string;
  };
  subject?: string;
  body?: string;
  files?: unknown[];
};

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

  private arrayToCommaSeparatedString(
    value: string | string[] | undefined,
  ): string {
    if (!isDefined(value)) {
      return '';
    }

    if (Array.isArray(value)) {
      return value.filter((v) => v.trim().length > 0).join(', ');
    }

    return value;
  }

  private migrateSendEmailInput(
    input: LegacySendEmailInput,
  ): MigratedSendEmailInput {
    const { email, recipients, ...rest } = input;

    let toValue = '';
    let ccValue = '';
    let bccValue = '';

    if (isDefined(recipients)) {
      toValue = this.arrayToCommaSeparatedString(recipients.to);
      ccValue = this.arrayToCommaSeparatedString(recipients.cc);
      bccValue = this.arrayToCommaSeparatedString(recipients.bcc);
    }

    if (isDefined(email) && email.trim().length > 0 && toValue.length === 0) {
      toValue = email;
    }

    return {
      ...rest,
      recipients: {
        to: toValue,
        cc: ccValue,
        bcc: bccValue,
      },
    };
  }

  private needsMigration(input: LegacySendEmailInput): boolean {
    if (isDefined(input.email)) {
      return true;
    }

    if (isDefined(input.recipients)) {
      if (Array.isArray(input.recipients.to)) {
        return true;
      }
      if (Array.isArray(input.recipients.cc)) {
        return true;
      }
      if (Array.isArray(input.recipients.bcc)) {
        return true;
      }
    }

    return false;
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

      if (!isDefined(steps) || steps.length === 0) {
        continue;
      }

      let hasChanges = false;
      const migratedSteps = steps.map((step) => {
        if (step.type !== WorkflowActionType.SEND_EMAIL) {
          return step;
        }

        const input = step.settings.input as LegacySendEmailInput;

        if (!this.needsMigration(input)) {
          return step;
        }

        hasChanges = true;
        const migratedInput = this.migrateSendEmailInput(input);

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
