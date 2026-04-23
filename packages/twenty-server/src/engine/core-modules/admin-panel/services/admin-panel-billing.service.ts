import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, type Repository } from 'typeorm';

import { AdminPanelWorkspaceBillingDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const CREDIT_BALANCE_MICRO_UNIT = 1_000_000;

@Injectable()
export class AdminPanelBillingService {
  constructor(
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getWorkspaceBilling(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingDTO | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const customer = await this.billingCustomerRepository.findOne({
      where: { workspaceId },
    });

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    if (!customer && !subscription) {
      return null;
    }

    const stripeCustomerId =
      customer?.stripeCustomerId ?? subscription?.stripeCustomerId ?? null;
    const creditBalance = customer
      ? customer.creditBalanceMicro / CREDIT_BALANCE_MICRO_UNIT
      : null;

    if (!subscription) {
      return {
        stripeCustomerId,
        creditBalance,
        subscription: null,
      };
    }

    const items = subscription.billingSubscriptionItems ?? [];
    const priceIds = items.map((item) => item.stripePriceId);
    const prices = priceIds.length
      ? await this.billingPriceRepository.find({
          where: { stripePriceId: In(priceIds) },
        })
      : [];
    const priceByStripeId = new Map(
      prices.map((price) => [price.stripePriceId, price]),
    );

    return {
      stripeCustomerId,
      creditBalance,
      subscription: {
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        status: subscription.status,
        interval: subscription.interval ?? null,
        currency: subscription.currency,
        planKey:
          typeof subscription.metadata?.plan === 'string'
            ? subscription.metadata.plan
            : null,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd,
        cancelAt: subscription.cancelAt,
        canceledAt: subscription.canceledAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        items: items.map((item) => {
          const price = priceByStripeId.get(item.stripePriceId);
          const firstTier = price?.tiers?.[0];
          const includedCredits =
            typeof firstTier?.up_to === 'number' ? firstTier.up_to : null;

          return {
            productName: item.billingProduct?.name ?? '',
            productKey:
              typeof item.billingProduct?.metadata?.productKey === 'string'
                ? item.billingProduct.metadata.productKey
                : null,
            stripePriceId: item.stripePriceId,
            quantity:
              item.quantity === null || item.quantity === undefined
                ? null
                : Number(item.quantity),
            unitAmount:
              price?.unitAmount === null || price?.unitAmount === undefined
                ? null
                : Number(price.unitAmount),
            includedCredits,
          };
        }),
      },
    };
  }
}
