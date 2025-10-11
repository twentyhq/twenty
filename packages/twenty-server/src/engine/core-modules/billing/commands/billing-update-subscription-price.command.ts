/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'billing:update-subscription-price',
  description: 'Update subscription price',
})
export class BillingUpdateSubscriptionPriceCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private stripePriceIdToUpdate: string;
  private newStripePriceId: string;
  private clearUsage = false;

  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(BillingSubscription)
    protected readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  @Option({
    flags: '--price-to-update-id [stripe_price_id]',
    description: 'Stripe price id to update',
    required: true,
  })
  parseStripePriceIdToMigrate(val: string): string {
    this.stripePriceIdToUpdate = val;

    return val;
  }

  @Option({
    flags: '--new-price-id [stripe_price_id]',
    description: 'New Stripe price id',
    required: true,
  })
  parseNewStripePriceId(val: string): string {
    this.newStripePriceId = val;

    return val;
  }

  @Option({
    flags: '--clear-usage',
    description: 'Clear usage on subscription item',
    required: false,
  })
  parseClearUsage() {
    this.clearUsage = true;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    const subscriptionItemToUpdate = subscription.billingSubscriptionItems.find(
      (item) => item.stripePriceId === this.stripePriceIdToUpdate,
    );

    if (!isDefined(subscriptionItemToUpdate)) {
      this.logger.log(`No price to update for workspace ${workspaceId}`);

      return;
    }

    if (!options.dryRun) {
      await this.stripeSubscriptionItemService.deleteSubscriptionItem(
        subscriptionItemToUpdate.stripeSubscriptionItemId,
        this.clearUsage,
      );

      await this.stripeSubscriptionItemService.createSubscriptionItem(
        subscription.stripeSubscriptionId,
        this.newStripePriceId,
        isDefined(subscriptionItemToUpdate.quantity)
          ? subscriptionItemToUpdate.quantity
          : undefined,
      );
    }

    this.logger.log(
      `Update subscription replacing price ${subscriptionItemToUpdate.stripePriceId} by ${this.newStripePriceId} with clear usage ${this.clearUsage} - workspace ${workspaceId}`,
    );
  }
}
