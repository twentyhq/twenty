/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'billing:sync-customer-data',
  description: 'Sync customer data from Stripe for all active workspaces',
})
export class BillingSyncCustomerDataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    @InjectRepository(BillingCustomer, 'core')
    protected readonly billingCustomerRepository: Repository<BillingCustomer>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
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

      if (stripeCustomerId) {
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
