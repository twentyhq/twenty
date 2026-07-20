/* @license Enterprise */

import chalk from 'chalk';
import { Command } from 'nest-commander';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  WorkspaceCommandRunner,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Command({
  name: 'billing:sync-customer-data',
  description: 'Sync customer data from Stripe for all active workspaces',
})
export class BillingSyncCustomerDataCommand extends WorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    protected readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {
    super(workspaceIteratorService, [
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
    ]);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const billingCustomer = await this.billingCustomerRepository.findOne(
      workspaceId,
      { where: {} },
    );

    if (!options.dryRun && !billingCustomer) {
      const stripeCustomerId =
        await this.stripeSubscriptionService.getStripeCustomerIdFromWorkspaceId(
          workspaceId,
        );

      if (typeof stripeCustomerId === 'string') {
        await this.billingCustomerRepository.upsert(
          workspaceId,
          { stripeCustomerId },
          { conflictPaths: ['workspaceId'] },
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
