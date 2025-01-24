import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

interface SyncCustomerDataCommandOptions
  extends ActiveWorkspacesCommandOptions {}

@Command({
  name: 'billing:sync-customer-data',
  description: 'Sync customer data from Stripe for all active workspaces',
})
export class BillingSyncCustomerDataCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    @InjectRepository(BillingCustomer, 'core')
    protected readonly billingCustomerRepository: Repository<BillingCustomer>,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: SyncCustomerDataCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to sync customer data');

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        await this.syncCustomerDataForWorkspace(workspaceId, options);
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}, ${error.stack}`,
          ),
        );
        continue;
      } finally {
        this.logger.log(
          chalk.green(`Finished running command for workspace ${workspaceId}.`),
        );
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }

  private async syncCustomerDataForWorkspace(
    workspaceId: string,
    options: SyncCustomerDataCommandOptions,
  ): Promise<void> {
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
