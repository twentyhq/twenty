/* @license Enterprise */

import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.64.0', 1795601305717)
@Command({
  name: 'upgrade:2-64:backfill-billing-customer-stripe-customer-email',
  description:
    'Backfill billingCustomer.stripeCustomerEmail from the Stripe customer email',
})
export class BackfillBillingCustomerStripeCustomerEmailCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!this.twentyConfigService.isBillingEnabled()) {
      return;
    }

    const [billingCustomer]: { stripeCustomerId: string }[] =
      await this.dataSource.query(
        `SELECT "stripeCustomerId" FROM "core"."billingCustomer"
         WHERE "workspaceId" = $1
           AND "stripeCustomerEmail" IS NULL`,
        [workspaceId],
      );

    if (!isDefined(billingCustomer)) {
      return;
    }

    const email = await this.getStripeCustomerEmail(
      billingCustomer.stripeCustomerId,
    );

    if (!isNonEmptyString(email)) {
      this.logger.log(
        `Stripe customer ${billingCustomer.stripeCustomerId} of workspace ${workspaceId} has no email, skipping`,
      );

      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would backfill' : 'Backfilling'} stripeCustomerEmail of workspace ${workspaceId}`,
    );

    if (options.dryRun) {
      return;
    }

    await this.dataSource.query(
      `UPDATE "core"."billingCustomer"
       SET "stripeCustomerEmail" = $2
       WHERE "workspaceId" = $1
         AND "stripeCustomerEmail" IS NULL`,
      [workspaceId, email],
    );
  }

  private async getStripeCustomerEmail(
    stripeCustomerId: string,
  ): Promise<string | null> {
    try {
      const { email } =
        await this.stripeCustomerService.getCustomerPartnerAndEmail(
          stripeCustomerId,
        );

      return email;
    } catch (error) {
      if (
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === 'resource_missing'
      ) {
        this.logger.warn(
          `Stripe customer ${stripeCustomerId} does not exist, skipping`,
        );

        return null;
      }

      throw error;
    }
  }
}
