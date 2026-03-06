/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'billing:sync-customer-data',
  description: 'Sync customer data from Stripe for all active workspaces',
})
export class BillingSyncCustomerDataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    @InjectRepository(BillingCustomerEntity)
    protected readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: {
        workspaceId,
      },
    });

    if (!options.dryRun && !billingCustomer) {
      const stripeCustomerId =
        await this.stripeSubscriptionService.getStripeCustomerIdFromWorkspaceId(
          workspaceId,
        );

      if (typeof stripeCustomerId === 'string') {
        await this.billingCustomerRepository.upsert(
          {
            stripeCustomerId,
            workspaceId,
          },
          {
            conflictPaths: ['workspaceId'],
          },
        );
      }
    }

    if (options.verbose) {
      this.logger.log(
        chalk.yellow(`Added ${workspaceId} to billingCustomer table`),
      );
    }
  }
}
