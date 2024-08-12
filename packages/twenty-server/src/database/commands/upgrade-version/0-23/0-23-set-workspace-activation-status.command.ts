import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';

interface SetWorkspaceActivationStatusCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23:set-workspace-activation-status',
  description: 'Set workspace activation status',
})
export class SetWorkspaceActivationStatusCommand extends CommandRunner {
  private readonly logger = new Logger(
    SetWorkspaceActivationStatusCommand.name,
  );
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: SetWorkspaceActivationStatusCommandOptions,
  ): Promise<void> {
    let activeSubscriptionWorkspaceIds: string[] = [];

    if (options.workspaceId) {
      activeSubscriptionWorkspaceIds = [options.workspaceId];
    } else {
      activeSubscriptionWorkspaceIds =
        await this.billingSubscriptionService.getActiveSubscriptionWorkspaceIds();
    }

    if (!activeSubscriptionWorkspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    } else {
      this.logger.log(
        chalk.green(
          `Running command on ${activeSubscriptionWorkspaceIds.length} workspaces`,
        ),
      );
    }

    for (const workspaceId of activeSubscriptionWorkspaceIds) {
      try {
        const dataSourceMetadatas =
          await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
            workspaceId,
          );

        for (const dataSourceMetadata of dataSourceMetadatas) {
          const workspaceDataSource =
            await this.typeORMService.connectToDataSource(dataSourceMetadata);

          if (workspaceDataSource) {
            try {
              await this.workspaceRepository.update(
                { id: workspaceId },
                { activationStatus: WorkspaceActivationStatus.ACTIVE },
              );
            } catch (error) {
              this.logger.log(
                chalk.red(`Running command on workspace ${workspaceId} failed`),
              );
              throw error;
            }
          }
        }

        await this.workspaceCacheVersionService.incrementVersion(workspaceId);

        this.logger.log(
          chalk.green(`Running command on workspace ${workspaceId} done`),
        );
      } catch (error) {
        this.logger.error(
          `Migration failed for workspace ${workspaceId}: ${error.message}`,
        );
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
