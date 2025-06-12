/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { differenceInDays } from 'date-fns';
import Stripe from 'stripe';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { getSubscriptionStatus } from 'src/engine/core-modules/billing/webhooks/utils/transform-stripe-subscription-event-to-database-subscription.util';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingProductService: BillingProductService,
    @InjectRepository(BillingEntitlement, 'core')
    private readonly billingEntitlementRepository: Repository<BillingEntitlement>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    private readonly interService: InterService,
  ) {}

  async getCurrentBillingSubscriptionOrThrow(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }) {
    const notCanceledSubscriptions =
      await this.billingSubscriptionRepository.find({
        where: {
          ...criteria,
          status: Not(
            In([SubscriptionStatus.Canceled, SubscriptionStatus.Expired]),
          ),
        },
        relations: [
          'billingCustomer',
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
          'billingSubscriptionItems.billingProduct.billingPrices',
        ],
      });

    assert(
      notCanceledSubscriptions.length <= 1,
      `More than one not canceled subscription for workspace ${criteria.workspaceId}`,
    );

    return notCanceledSubscriptions?.[0];
  }

  async getBaseProductCurrentBillingSubscriptionItemOrThrow(
    workspaceId: string,
  ) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const planKey = getPlanKeyFromSubscription(billingSubscription);

    const baseProduct =
      await this.billingPlanService.getPlanBaseProduct(planKey);

    if (!baseProduct) {
      throw new BillingException(
        'Base product not found',
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    const stripeProductId = baseProduct.stripeProductId;

    const billingSubscriptionItem =
      billingSubscription.billingSubscriptionItems.filter(
        (billingSubscriptionItem) =>
          billingSubscriptionItem.stripeProductId === stripeProductId,
      )?.[0];

    if (!billingSubscriptionItem) {
      throw new Error(
        `Cannot find billingSubscriptionItem for product ${stripeProductId} for workspace ${workspaceId}`,
      );
    }

    return billingSubscriptionItem;
  }

  async deleteSubscriptions(workspaceId: string) {
    const subscriptionToCancel =
      await this.getCurrentBillingSubscriptionOrThrow({
        workspaceId,
      });

    if (subscriptionToCancel) {
      await this.stripeSubscriptionService.cancelSubscription(
        subscriptionToCancel.stripeSubscriptionId,
      );
    }
    await this.billingSubscriptionRepository.delete({ workspaceId });
  }

  async handleUnpaidInvoices(data: Stripe.SetupIntentSucceededEvent.Data) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { stripeCustomerId: data.object.customer as string },
    );

    if (billingSubscription?.status === 'unpaid') {
      await this.stripeSubscriptionService.collectLastInvoice(
        billingSubscription.stripeSubscriptionId,
      );
    }

    return {
      handleUnpaidInvoiceStripeSubscriptionId:
        billingSubscription?.stripeSubscriptionId,
    };
  }

  async getWorkspaceEntitlementByKey(
    workspaceId: string,
    key: BillingEntitlementKey,
  ) {
    const entitlement = await this.billingEntitlementRepository.findOneBy({
      workspaceId,
      key,
      value: true,
    });

    if (!entitlement) {
      return false;
    }

    return entitlement.value;
  }

  async switchToYearlyInterval(workspace: Workspace) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    if (billingSubscription.interval === SubscriptionInterval.Year) {
      throw new BillingException(
        'Cannot switch from yearly to monthly billing interval',
        BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE,
      );
    }

    const newInterval = SubscriptionInterval.Year;

    const planKey = getPlanKeyFromSubscription(billingSubscription);
    const billingProductsByPlan =
      await this.billingProductService.getProductsByPlan(planKey);
    const pricesPerPlanArray =
      this.billingProductService.getProductPricesByInterval({
        interval: newInterval,
        billingProductsByPlan,
      });

    const subscriptionItemsToUpdate = this.getSubscriptionItemsToUpdate(
      billingSubscription,
      pricesPerPlanArray,
    );

    await this.stripeSubscriptionService.updateSubscriptionItems(
      billingSubscription.stripeSubscriptionId,
      subscriptionItemsToUpdate,
    );
  }

  private getSubscriptionItemsToUpdate(
    billingSubscription: BillingSubscription,
    billingPricesPerPlanAndIntervalArray: BillingPrice[],
  ): BillingSubscriptionItem[] {
    const subscriptionItemsToUpdate =
      billingSubscription.billingSubscriptionItems.map((subscriptionItem) => {
        const matchingPrice = billingPricesPerPlanAndIntervalArray.find(
          (price) => price.stripeProductId === subscriptionItem.stripeProductId,
        );

        if (!matchingPrice) {
          throw new BillingException(
            `Cannot find matching price for product ${subscriptionItem.stripeProductId}`,
            BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
          );
        }

        return {
          ...subscriptionItem,
          stripePriceId: matchingPrice.stripePriceId,
        };
      });

    return subscriptionItemsToUpdate;
  }

  async endTrialPeriod(workspace: Workspace) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    if (billingSubscription.status !== SubscriptionStatus.Trialing) {
      throw new BillingException(
        'Billing subscription is not in trial period',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD,
      );
    }

    const hasPaymentMethod = await this.stripeCustomerService.hasPaymentMethod(
      billingSubscription.stripeCustomerId,
    );

    if (!hasPaymentMethod) {
      return { hasPaymentMethod: false, status: undefined };
    }

    const updatedSubscription =
      await this.stripeSubscriptionService.updateSubscription(
        billingSubscription.stripeSubscriptionId,
        {
          trial_end: 'now',
        },
      );

    await this.billingSubscriptionItemRepository.update(
      { stripeSubscriptionId: updatedSubscription.id },
      { hasReachedCurrentPeriodCap: false },
    );

    return {
      status: getSubscriptionStatus(updatedSubscription.status),
      hasPaymentMethod: true,
    };
  }

  async setBillingThresholdsAndTrialPeriodWorkflowCredits(
    billingSubscriptionId: string,
  ) {
    const billingSubscription =
      await this.billingSubscriptionRepository.findOneOrFail({
        where: { id: billingSubscriptionId },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
        ],
      });

    await this.stripeSubscriptionService.updateSubscription(
      billingSubscription.stripeSubscriptionId,
      {
        billing_thresholds: {
          amount_gte: this.twentyConfigService.get(
            'BILLING_SUBSCRIPTION_THRESHOLD_AMOUNT',
          ),
          reset_billing_cycle_anchor: false,
        },
      },
    );

    const workflowSubscriptionItem =
      billingSubscription.billingSubscriptionItems.find(
        (item) =>
          item.billingProduct.metadata.productKey ===
          BillingProductKey.WORKFLOW_NODE_EXECUTION,
      );

    if (!workflowSubscriptionItem) {
      throw new BillingException(
        'Workflow subscription item not found',
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    await this.stripeSubscriptionItemService.updateSubscriptionItem(
      workflowSubscriptionItem.stripeSubscriptionItemId,
      {
        metadata: {
          trialPeriodFreeWorkflowCredits:
            this.getTrialPeriodFreeWorkflowCredits(billingSubscription),
        },
      },
    );
  }

  async switchSubscriptionPlan(
    subscription: BillingSubscription,
    plan: BillingPlanKey,
  ) {
    await this.billingSubscriptionRepository.save({
      id: subscription.id,
      metadata: {
        ...subscription.metadata,
        plan,
      } as Stripe.Metadata,
    });

    const updatedSubscription =
      await this.billingSubscriptionRepository.findOneOrFail({
        where: {
          id: subscription.id,
        },
        relations: {
          billingSubscriptionItems: true,
        },
      });

    assert(
      updatedSubscription.metadata.plan === plan,
      `Failed to switch subscription plan from ${subscription.metadata?.plan} to ${plan}`,
    );

    // TODO: Skip this block if the subscription was created from Inter as a payment provider
    {
      const planKey = getPlanKeyFromSubscription(updatedSubscription);

      const baseProduct =
        await this.billingPlanService.getPlanBaseProduct(planKey);

      if (!baseProduct) {
        throw new BillingException(
          'Base product not found',
          BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
        );
      }

      for (const subscriptionItem of updatedSubscription.billingSubscriptionItems) {
        const baseProductPrice = baseProduct.billingPrices.filter(
          (price) => price.interval === subscription.interval && price.active,
        );

        if (!baseProductPrice || baseProductPrice.length === 0)
          throw new BillingException(
            `Cannot find base product price for ${plan} plan`,
            BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
          );

        await this.stripeSubscriptionItemService.updateSubscriptionItem(
          subscriptionItem.stripeSubscriptionItemId,
          {
            price: baseProductPrice[0].stripePriceId,
          },
        );

        await this.billingSubscriptionItemRepository.save({
          id: subscriptionItem.id,
          stripePriceId: baseProductPrice[0].stripePriceId,
          stripeProductId: baseProduct.stripeProductId,
        });
      }

      const updatedStripeSubscription =
        await this.stripeSubscriptionService.updateSubscription(
          updatedSubscription.stripeSubscriptionId,
          {
            metadata: {
              ...updatedSubscription.metadata,
              plan,
            },
          },
        );

      assert(
        updatedStripeSubscription.metadata.plan === plan,
        `Failed to switch stripe subscription plan from ${updatedStripeSubscription.metadata.plan} to ${plan}`,
      );
    }

    const baseProduct =
      await this.getBaseProductCurrentBillingSubscriptionItemOrThrow(
        subscription.workspaceId as string,
      );

    return {
      baseProduct,
      subscription: updatedSubscription,
      planKey: updatedSubscription.metadata.plan as BillingPlanKey,
    };
  }

  async updateOneTimePaymentSubscription({
    subscription,
    user,
    locale,
  }: {
    subscription: BillingSubscription;
    user: User;
    locale?: keyof typeof APP_LOCALES;
  }) {
    const billingPricesPerPlan = await this.billingPlanService.getPricesPerPlan(
      {
        planKey: subscription.metadata.plan as BillingPlanKey,
        interval: subscription.interval as SubscriptionInterval,
      },
    );

    const { billingCustomer } = subscription;

    if (!isDefined(billingCustomer))
      throw new BillingException(
        `Customer not found`,
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );

    const { name, document, legalEntity, address, cep, stateUnity, city } =
      billingCustomer;

    const chargeDataArray: (string | null | undefined)[] = [
      name,
      document,
      legalEntity,
      address,
      cep,
      stateUnity,
      city,
    ];

    if (chargeDataArray.includes(null) || chargeDataArray.includes(undefined))
      throw new BillingException(
        `Customer missing inter charge data`,
        BillingExceptionCode.BILLING_MISSING_REQUEST_BODY,
      );

    if (!isDefined(billingPricesPerPlan?.baseProductPrice.unitAmountDecimal))
      throw new BillingException(
        `Plan price not found`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );

    return await this.interService.createBolepixCharge({
      planPrice: billingPricesPerPlan.baseProductPrice.unitAmountDecimal,
      workspaceId: subscription.workspaceId as string,
      userEmail: user.email,
      locale: locale || SOURCE_LOCALE,
      customer: billingCustomer,
      planKey: subscription.metadata.plan as BillingPlanKey,
    });
  }

  private getTrialPeriodFreeWorkflowCredits(
    billingSubscription: BillingSubscription,
  ) {
    const trialDuration =
      isDefined(billingSubscription.trialEnd) &&
      isDefined(billingSubscription.trialStart)
        ? differenceInDays(
            billingSubscription.trialEnd,
            billingSubscription.trialStart,
          )
        : 0;

    const trialWithCreditCardDuration = this.twentyConfigService.get(
      'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
    );

    return Number(
      this.twentyConfigService.get(
        trialDuration === trialWithCreditCardDuration
          ? 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD'
          : 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD',
      ),
    );
  }
}
