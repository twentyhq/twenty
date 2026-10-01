/* @license Enterprise */

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  WorkspaceCommandRunner,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { BillingEntitlementSyncService } from 'src/engine/core-modules/billing-webhook/services/billing-entitlement-sync.service';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeEntitlementService } from 'src/engine/core-modules/billing/stripe/services/stripe-entitlement.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Stripe stops retrying failed webhooks and a missing entitlement reads as denied, so dropped events need reconciling
@Command({
  name: 'billing:sync-entitlements',
  description: 'Reconcile billing entitlements with Stripe for all workspaces',
})
export class BillingSyncEntitlementsCommand extends WorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeEntitlementService: StripeEntitlementService,
    private readonly billingEntitlementSyncService: BillingEntitlementSyncService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {
    super(workspaceIteratorService, [
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
    ]);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    index,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      if (index === 0) {
        this.logger.log(
          chalk.yellow('Billing is disabled, skipping entitlement sync'),
        );
      }

      return;
    }

    const billingCustomer = await this.billingCustomerRepository.findOne(
      workspaceId,
      { where: {} },
    );

    if (!isDefined(billingCustomer)) {
      if (options.verbose) {
        this.logger.log(
          chalk.grey(`No billing customer for workspace ${workspaceId}`),
        );
      }

      return;
    }

    const activeLookupKeys =
      await this.stripeEntitlementService.getActiveEntitlementLookupKeys(
        billingCustomer.stripeCustomerId,
      );

    if (options.dryRun) {
      this.logger.log(
        chalk.grey(
          `Workspace ${workspaceId} active entitlements in Stripe: ${activeLookupKeys.join(', ') || 'none'}`,
        ),
      );

      return;
    }

    const billingEntitlements =
      await this.billingEntitlementSyncService.syncEntitlements({
        workspaceId,
        stripeCustomerId: billingCustomer.stripeCustomerId,
        activeLookupKeys,
      });

    if (options.verbose) {
      this.logger.log(
        chalk.yellow(
          `Workspace ${workspaceId} entitlements: ${billingEntitlements
            .map(({ key, value }) => `${key}=${value}`)
            .join(' ')}`,
        ),
      );
    }
  }
}
