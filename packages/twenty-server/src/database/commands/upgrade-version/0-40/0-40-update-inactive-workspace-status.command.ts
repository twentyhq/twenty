import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared';
import { In, Repository } from 'typeorm';

import {
  BaseCommandOptions,
  BaseCommandRunner,
} from 'src/database/commands/base.command';
import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

type UpdateInactiveWorkspaceStatusOptions = BaseCommandOptions & {
  workspaceIds: string[];
};

@Command({
  name: 'upgrade-0.40:update-inactive-workspace-status',
  description:
    'Update the status of inactive workspaces to SUSPENDED and delete them',
})
export class UpdateInactiveWorkspaceStatusCommand extends BaseCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    protected readonly datasourceRepository: Repository<DataSourceEntity>,
    @InjectRepository(WorkspaceMigrationEntity, 'metadata')
    protected readonly workspaceMigrationRepository: Repository<WorkspaceMigrationEntity>,
    @InjectRepository(BillingSubscription, 'core')
    protected readonly subscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(FeatureFlagEntity, 'core')
    protected readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(KeyValuePair, 'core')
    protected readonly keyValuePairRepository: Repository<KeyValuePair>,
    @InjectRepository(UserWorkspace, 'core')
    protected readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(User, 'core')
    protected readonly userRepository: Repository<User>,
    private readonly typeORMService: TypeORMService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-ids [workspaceIds]',
    description: 'Workspace ids to process (comma separated)',
  })
  parseWorkspaceIds(val: string): string[] {
    return val.split(',');
  }

  override async executeBaseCommand(
    _passedParams: string[],
    options: UpdateInactiveWorkspaceStatusOptions,
  ): Promise<void> {
    const whereCondition: any = {
      activationStatus: WorkspaceActivationStatus.INACTIVE,
    };

    if (options.workspaceIds?.length > 0) {
      whereCondition.id = In(options.workspaceIds);
    }

    const workspaces = await this.workspaceRepository.find({
      where: whereCondition,
    });

    if (options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    this.logger.log(
      chalk.blue(
        `Found ${workspaces.length} inactive workspace${
          workspaces.length > 1 ? 's' : ''
        }`,
      ),
    );

    await rawDataSource.initialize();

    for (const workspace of workspaces) {
      this.logger.log(
        chalk.blue(
          `Processing workspace ${workspace.id} with name ${workspace.displayName}`,
        ),
      );
      // Check if the workspace has a datasource
      const datasource = await this.datasourceRepository.findOne({
        where: { workspaceId: workspace.id },
      });

      const schemaName = datasource?.schema;

      const postgresSchemaExists = await this.typeORMService
        .getMainDataSource()
        .query(
          `SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '${schemaName}'`,
        );

      if (!schemaName || !postgresSchemaExists) {
        await this.deleteWorkspaceAndMarkAsSuspended(workspace, options);
        continue;
      }

      const subscriptions = await this.subscriptionRepository.find({
        where: { workspaceId: workspace.id },
      });

      if (subscriptions.length > 1) {
        this.logger.warn(chalk.red('More than one subscription found'));
        continue;
      }

      const subscription = subscriptions[0];

      if (!subscription) {
        this.logger.log(chalk.red('No subscription found'));
        await this.deleteWorkspaceAndMarkAsSuspendedAndDeleteAllData(
          workspace,
          schemaName,
          options,
        );
        continue;
      }

      const thirtyDaysAgo = new Date();

      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (
        ([
          SubscriptionStatus.Canceled,
          SubscriptionStatus.Incomplete,
          SubscriptionStatus.IncompleteExpired,
          SubscriptionStatus.Unpaid,
          SubscriptionStatus.Paused,
        ].includes(subscription.status) &&
          subscription.canceledAt &&
          subscription.canceledAt < thirtyDaysAgo) ||
        (subscription.canceledAt === null &&
          subscription.updatedAt &&
          subscription.updatedAt < thirtyDaysAgo)
      ) {
        await this.deleteWorkspaceAndMarkAsSuspendedAndDeleteAllData(
          workspace,
          schemaName,
          options,
          subscription,
        );
        continue;
      }

      await this.markAsSuspended(workspace, options);
    }
  }

  private async deleteWorkspaceAndMarkAsSuspended(
    workspace: Workspace,
    options: UpdateInactiveWorkspaceStatusOptions,
  ) {
    this.logger.log(
      chalk.blue('(!!) Deleting workspace and marking as suspended'),
    );

    if (!options.dryRun) {
      await this.workspaceRepository.update(workspace.id, {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      });

      await this.workspaceRepository.softRemove({ id: workspace.id });
    }
  }

  private async deleteWorkspaceAndMarkAsSuspendedAndDeleteAllData(
    workspace: Workspace,
    schemaName: string,
    options: UpdateInactiveWorkspaceStatusOptions,
    billingSubscription?: BillingSubscription,
  ) {
    this.logger.warn(
      chalk.blue(
        `(!!!) Deleting workspace and marking as suspended and deleting all data for workspace updated at ${workspace.updatedAt} with subscription status ${billingSubscription?.status} and subscription updatedAt ${billingSubscription?.updatedAt} and canceledAt ${billingSubscription?.canceledAt}`,
      ),
    );

    if (!options.dryRun) {
      await this.workspaceRepository.update(workspace.id, {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      });

      await this.workspaceRepository.softRemove({ id: workspace.id });

      await this.datasourceRepository.delete({ workspaceId: workspace.id });
      await this.workspaceMigrationRepository.delete({
        workspaceId: workspace.id,
      });

      await this.featureFlagRepository.delete({ workspaceId: workspace.id });
      await this.keyValuePairRepository.delete({ workspaceId: workspace.id });

      const userWorkspaces = await this.userWorkspaceRepository.find({
        where: { workspaceId: workspace.id },
      });

      for (const userWorkspace of userWorkspaces) {
        await this.userWorkspaceRepository.delete({ id: userWorkspace.id });

        const remainingUserWorkspaces =
          await this.userWorkspaceRepository.count({
            where: { userId: userWorkspace.userId },
          });

        if (remainingUserWorkspaces === 0) {
          await this.userRepository.softRemove({ id: userWorkspace.userId });
        }
      }

      await this.typeORMService
        .getMainDataSource()
        .query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    }
  }

  private async markAsSuspended(
    workspace: Workspace,
    options: UpdateInactiveWorkspaceStatusOptions,
  ) {
    this.logger.log(chalk.blue('(!) Marking as suspended'));
    if (!options.dryRun) {
      await this.workspaceRepository.update(workspace.id, {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      });
    }
  }
}
