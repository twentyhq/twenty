/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';

@Command({
  name: 'billing:sync-customer-data',
  description: 'Sync customer data from Stripe for all active workspaces',
})
export class BillingSyncCustomerDataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    @InjectRepository(BillingCustomerEntity)
    protected readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
  ) {
    super(workspaceIteratorService);
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
