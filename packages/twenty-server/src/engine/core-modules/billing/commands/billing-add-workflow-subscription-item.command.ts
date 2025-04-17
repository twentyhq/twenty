/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'billing:add-workflow-subscription-item',
  description: 'Add workflow subscription item to all workspaces subscriptions',
})
export class BillingAddWorkflowSubscriptionItemCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(BillingSubscription, 'core')
    protected readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingProduct, 'core')
    protected readonly billingProductRepository: Repository<BillingProduct>,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const billingProducts = await this.billingProductRepository.find({
      relations: ['billingPrices'],
    });

    const subscription = await this.billingSubscriptionRepository.findOneOrFail(
      {
        where: {
          workspaceId,
        },
        relations: ['billingSubscriptionItems'],
      },
    );

    const { basedProduct, basedPrice } =
      this.getSubscriptionBasedProductAndPrice(billingProducts, subscription);

    const associatedWorkflowMeteredPrice =
      this.getAssociatedWorkflowMeteredBillingPrice(
        billingProducts,
        basedProduct,
        basedPrice,
      );

    const hasAlreadyWorkflowSubscriptionItem =
      subscription.billingSubscriptionItems.some(
        (item) =>
          item.stripePriceId === associatedWorkflowMeteredPrice.stripePriceId,
      );

    if (hasAlreadyWorkflowSubscriptionItem) {
      this.logger.log(
        `Workflow subscription item with price ${associatedWorkflowMeteredPrice.stripePriceId} already exists for ${workspaceId}`,
      );

      return;
    }

    if (!options.dryRun) {
      await this.stripeSubscriptionService.updateSubscription(
        subscription.stripeSubscriptionId,
        {
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'create_invoice',
            },
          },
        },
      );

      await this.stripeSubscriptionItemService.createSubscriptionItem(
        subscription.stripeSubscriptionId,
        associatedWorkflowMeteredPrice.stripePriceId,
      );

      await this.stripeSubscriptionService.updateSubscription(
        subscription.stripeSubscriptionId,
        {
          billing_thresholds: {
            amount_gte: this.twentyConfigService.get(
              'BILLING_SUBSCRIPTION_THRESHOLD_AMOUNT',
            ),
            reset_billing_cycle_anchor: false,
          },
        },
      );
    }

    this.logger.log(
      `Adding workflow subscription item with price ${associatedWorkflowMeteredPrice.stripePriceId} to ${workspaceId}`,
    );
  }

  private getSubscriptionBasedProductAndPrice(
    billingProducts: BillingProduct[],
    subscription: BillingSubscription,
  ) {
    const basedProductSubscriptionItem =
      subscription?.billingSubscriptionItems.find((item) => {
        return billingProducts.some((product) => {
          const isBasedProduct =
            product.stripeProductId === item.stripeProductId &&
            product.metadata.productKey === BillingProductKey.BASE_PRODUCT;

          return isBasedProduct;
        });
      });

    if (!basedProductSubscriptionItem) {
      throw new Error('Based product subscription item not found');
    }

    const { stripeProductId, stripePriceId } = basedProductSubscriptionItem;

    const basedProduct = billingProducts.find(
      (product) => product.stripeProductId === stripeProductId,
    );

    const basedPrice = basedProduct?.billingPrices.find(
      (price) => price.stripePriceId === stripePriceId,
    );

    if (!basedProduct || !basedPrice) {
      throw new Error(
        `Based product ${stripeProductId} or price ${stripePriceId} not found`,
      );
    }

    return { basedProduct, basedPrice };
  }

  private getAssociatedWorkflowMeteredBillingPrice(
    billingProducts: BillingProduct[],
    basedProduct: BillingProduct,
    basedPrice: BillingPrice,
  ) {
    const associatedMeteredProduct = billingProducts.find(
      (product) =>
        product.metadata.planKey === basedProduct.metadata.planKey &&
        product.metadata.productKey ===
          BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    const associatedMeteredPrice = associatedMeteredProduct?.billingPrices.find(
      (price) => price.interval === basedPrice.interval,
    );

    if (!associatedMeteredPrice) {
      throw new Error(
        `Associated metered price for ${basedProduct.name} ${basedPrice.interval} not found`,
      );
    }

    return associatedMeteredPrice;
  }
}
