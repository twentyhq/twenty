import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { LoadServiceWithWorkspaceContext } from 'src/engine/twenty-orm/context/load-service-with-workspace.context';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CalendarChannelSyncStatus } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

interface SetUserVarsAccountsToReconnectCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23:set-workspace-activation-status',
  description: 'Set workspace activation status',
})
export class SetUserVarsAccountsToReconnectCommand extends CommandRunner {
  private readonly logger = new Logger(
    SetUserVarsAccountsToReconnectCommand.name,
  );
  constructor(
    private readonly userVarsService: UserVarsService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly loadServiceWithWorkspaceContext: LoadServiceWithWorkspaceContext,
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
    options: SetUserVarsAccountsToReconnectCommandOptions,
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
        const dataSourceMetadata =
          await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
            workspaceId,
          )[0];

        const workspaceDataSource =
          await this.typeORMService.connectToDataSource(dataSourceMetadata);

        if (workspaceDataSource) {
          const connectedAccountRepository =
            await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
              workspaceId,
              'connectedAccount',
            );

          const userVarsServiceInstance =
            await this.loadServiceWithWorkspaceContext.load(
              this.userVarsService,
              workspaceId,
            );

          const queryRunner = workspaceDataSource.createQueryRunner();

          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            const connectedAccountsInFailedInsufficientPermissions =
              await connectedAccountRepository.find({
                where: [
                  {
                    messageChannels: {
                      syncStatus:
                        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
                    },
                  },
                  {
                    calendarChannels: {
                      syncStatus:
                        CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
                    },
                  },
                ],
              });

            for (const connectedAccount of connectedAccountsInFailedInsufficientPermissions) {
            }

            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.log(
              chalk.red(`Running command on workspace ${workspaceId} failed`),
            );
            throw error;
          } finally {
            await queryRunner.release();
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
