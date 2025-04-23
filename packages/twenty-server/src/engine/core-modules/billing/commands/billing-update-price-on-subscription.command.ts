/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'billing:Update-price-on-subscription',
  description: 'Update price on subscription',
})
export class BillingUpdatePriceOnSubscriptionCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private StripePriceIdToMigrate: string;
  private newStripePriceId: string;
  private clearUsage: boolean;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(BillingSubscription, 'core')
    protected readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingProduct, 'core')
    protected readonly billingProductRepository: Repository<BillingProduct>,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  @Option({
    flags: '--price-to-update [stripe_price_id]',
    description: 'Stripe price id to update',
    required: true,
  })
  parseStripePriceIdToMigrate(val: string): string {
    this.StripePriceIdToMigrate = val;

    return val;
  }

  @Option({
    flags: '--new-price [stripe_price_id]',
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
    const subscription = await this.billingSubscriptionRepository.findOneOrFail(
      {
        where: {
          workspaceId,
        },
        relations: ['billingSubscriptionItems'],
      },
    );

    const subscriptionItemToReplace =
      subscription.billingSubscriptionItems.find(
        (item) => item.stripePriceId === this.StripePriceIdToMigrate,
      );

    if (!isDefined(subscriptionItemToReplace)) {
      this.logger.log(`No price to update for workspace ${workspaceId}`);

      return;
    }

    if (!options.dryRun) {
      await this.stripeSubscriptionItemService.deleteSubscriptionItem(
        subscriptionItemToReplace.stripeSubscriptionItemId,
        !!this.clearUsage,
      );

      await this.stripeSubscriptionItemService.createSubscriptionItem(
        subscription.stripeSubscriptionId,
        this.newStripePriceId,
        isDefined(subscriptionItemToReplace.quantity)
          ? subscriptionItemToReplace.quantity
          : undefined,
      );
    }

    this.logger.log(
      `Update subscription replacing price ${subscriptionItemToReplace.stripePriceId} by ${this.newStripePriceId} with clear usage ${!!this.clearUsage} - workspace ${workspaceId}`,
    );
  }
}
