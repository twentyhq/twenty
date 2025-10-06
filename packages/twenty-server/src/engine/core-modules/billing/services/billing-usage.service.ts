/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingMeteredProductUsageOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-metered-product-usage.output';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { type BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class BillingUsageService {
  protected readonly logger = new Logger(BillingUsageService.name);
  constructor(
    @InjectRepository(BillingCustomer)
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
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
      await this.stripeBillingMeterEventService.sendBillingMeterEvent({
        eventName: billingEvents[0].eventName,
        value: billingEvents[0].value,
        stripeCustomerId: workspaceStripeCustomer.stripeCustomerId,
      });
    } catch (error) {
      throw new BillingException(
        `Failed to send billing meter events to Stripe: ${error}`,
        BillingExceptionCode.BILLING_METER_EVENT_FAILED,
      );
    }
  }

  async getMeteredProductsUsage(
    workspace: Workspace,
  ): Promise<BillingMeteredProductUsageOutput[]> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId: workspace.id },
      );

    const meteredSubscriptionItemDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscription.id,
      );

    let periodStart: Date;
    let periodEnd: Date;

    if (
      subscription.status === SubscriptionStatus.Trialing &&
      isDefined(subscription.trialStart) &&
      isDefined(subscription.trialEnd)
    ) {
      periodStart = subscription.trialStart;
      periodEnd = subscription.trialEnd;
    } else {
      periodStart = subscription.currentPeriodStart;
      periodEnd = subscription.currentPeriodEnd;
    }

    return Promise.all(
      meteredSubscriptionItemDetails.map(async (item) => {
        const meterEventsSum =
          await this.stripeBillingMeterEventService.sumMeterEvents(
            item.stripeMeterId,
            subscription.stripeCustomerId,
            periodStart,
            periodEnd,
          );

        return {
          productKey: item.productKey,
          periodStart,
          periodEnd,
          usedCredits: meterEventsSum,
          grantedCredits:
            subscription.status === SubscriptionStatus.Trialing
              ? item.freeTrialQuantity
              : item.tierQuantity,
          unitPriceCents: item.unitPriceCents,
        };
      }),
    );
  }
}
