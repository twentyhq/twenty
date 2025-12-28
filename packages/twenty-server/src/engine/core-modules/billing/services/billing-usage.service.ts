/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingMeteredProductUsageOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-metered-product-usage.output';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';
import { type BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class BillingUsageService {
  protected readonly logger = new Logger(BillingUsageService.name);
  constructor(
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
    private readonly stripeCreditGrantService: StripeCreditGrantService,
  ) {}

  async canFeatureBeUsed(workspaceId: string): Promise<boolean> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return true;
    }

    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    return !!billingSubscription;
  }

  async billUsage({
    workspaceId,
    billingEvents,
  }: {
    workspaceId: string;
    billingEvents: BillingUsageEvent[];
  }) {
    const workspaceStripeCustomer =
      await this.billingCustomerRepository.findOne({
        where: {
          workspaceId,
        },
      });

    if (!workspaceStripeCustomer) {
      throw new BillingException(
        'Stripe customer not found',
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );
    }

    try {
      await Promise.all(
        billingEvents.map((event) =>
          this.stripeBillingMeterEventService.sendBillingMeterEvent({
            eventName: event.eventName,
            value: event.value,
            stripeCustomerId: workspaceStripeCustomer.stripeCustomerId,
            dimensions: event.dimensions,
          }),
        ),
      );
    } catch (error) {
      throw new BillingException(
        `Failed to send billing meter events to Stripe: ${error}`,
        BillingExceptionCode.BILLING_METER_EVENT_FAILED,
      );
    }
  }

  async getMeteredProductsUsage(
    workspace: WorkspaceEntity,
  ): Promise<BillingMeteredProductUsageOutput[]> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId: workspace.id },
      );

    const meteredSubscriptionItemDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscription.id,
      );

    const { periodStart, periodEnd } = this.getSubscriptionPeriod(subscription);

    return Promise.all(
      meteredSubscriptionItemDetails.map((item) =>
        this.buildMeteredProductUsage(
          subscription,
          item,
          periodStart,
          periodEnd,
        ),
      ),
    );
  }

  private getSubscriptionPeriod(subscription: BillingSubscriptionEntity): {
    periodStart: Date;
    periodEnd: Date;
  } {
    const isTrialing =
      subscription.status === SubscriptionStatus.Trialing &&
      isDefined(subscription.trialStart) &&
      isDefined(subscription.trialEnd);

    if (isTrialing) {
      return {
        periodStart: subscription.trialStart!,
        periodEnd: subscription.trialEnd!,
      };
    }

    return {
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
    };
  }

  private async buildMeteredProductUsage(
    subscription: BillingSubscriptionEntity,
    item: Awaited<
      ReturnType<
        typeof this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails
      >
    >[number],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingMeteredProductUsageOutput> {
    const meterEventsSum =
      await this.stripeBillingMeterEventService.sumMeterEvents(
        item.stripeMeterId,
        subscription.stripeCustomerId,
        periodStart,
        periodEnd,
      );

    const grantedCredits =
      subscription.status === SubscriptionStatus.Trialing
        ? item.freeTrialQuantity
        : item.tierQuantity;

    const rolloverCredits =
      await this.stripeCreditGrantService.getCustomerCreditBalance(
        subscription.stripeCustomerId,
        item.unitPriceCents,
      );

    return {
      productKey: item.productKey,
      periodStart,
      periodEnd,
      usedCredits: meterEventsSum,
      grantedCredits,
      rolloverCredits,
      totalGrantedCredits: grantedCredits + rolloverCredits,
      unitPriceCents: item.unitPriceCents,
    };
  }
}
