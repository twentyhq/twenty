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
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { StripeEntitlementService } from 'src/engine/core-modules/billing/stripe/services/stripe-entitlement.service';
import { buildBillingEntitlementsFromLookupKeys } from 'src/engine/core-modules/billing/utils/build-billing-entitlements-from-lookup-keys.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Entitlements otherwise only ever arrive through the
// entitlements.active_entitlement_summary.updated webhook. Stripe stops
// retrying a failed delivery after a few days and a missing row reads as
// denied, so without a reconciliation pass a dropped event silently removes a
// paid feature until the customer's subscription happens to change again.
@Command({
  name: 'billing:sync-entitlements',
  description: 'Reconcile billing entitlements with Stripe for all workspaces',
})
export class BillingSyncEntitlementsCommand extends WorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly stripeEntitlementService: StripeEntitlementService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    @InjectWorkspaceScopedRepository(BillingEntitlementEntity)
    private readonly billingEntitlementRepository: WorkspaceScopedRepository<BillingEntitlementEntity>,
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

    const billingEntitlements = buildBillingEntitlementsFromLookupKeys({
      workspaceId,
      stripeCustomerId: billingCustomer.stripeCustomerId,
      activeLookupKeys,
    });

    if (!options.dryRun) {
      await this.billingEntitlementRepository.upsert(
        workspaceId,
        billingEntitlements,
        {
          conflictPaths: ['workspaceId', 'key'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    }

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
