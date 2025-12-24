/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';

@Injectable()
export class BillingCreditRolloverService {
  protected readonly logger = new Logger(BillingCreditRolloverService.name);

  constructor(
    private readonly stripeCreditGrantService: StripeCreditGrantService,
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
  ) {}

  async processRolloverOnPeriodTransition({
    stripeCustomerId,
    subscriptionId,
    stripeMeterId,
    previousPeriodStart,
    previousPeriodEnd,
    newPeriodEnd,
    tierQuantity,
    unitPriceCents,
  }: {
    stripeCustomerId: string;
    subscriptionId: string;
    stripeMeterId: string;
    previousPeriodStart: Date;
    previousPeriodEnd: Date;
    newPeriodEnd: Date;
    tierQuantity: number;
    unitPriceCents: number;
  }): Promise<void> {
    const usedCredits =
      await this.stripeBillingMeterEventService.sumMeterEvents(
        stripeMeterId,
        stripeCustomerId,
        previousPeriodStart,
        previousPeriodEnd,
      );

    this.logger.log(
      `Rollover calculation for customer ${stripeCustomerId}: used ${usedCredits} of ${tierQuantity} credits`,
    );

    const unusedCredits = Math.max(0, tierQuantity - usedCredits);

    if (unusedCredits <= 0) {
      this.logger.log(
        `No rollover needed for customer ${stripeCustomerId}: all credits used`,
      );

      return;
    }

    const rolloverAmount = Math.min(unusedCredits, tierQuantity);

    this.logger.log(
      `Creating rollover credit grant for customer ${stripeCustomerId}: ${rolloverAmount} credits (unused: ${unusedCredits}, cap: ${tierQuantity})`,
    );

    await this.stripeCreditGrantService.createCreditGrant({
      customerId: stripeCustomerId,
      creditUnits: rolloverAmount,
      unitPriceCents,
      expiresAt: newPeriodEnd,
      metadata: {
        type: 'rollover',
        fromPeriodStart: previousPeriodStart.toISOString(),
        fromPeriodEnd: previousPeriodEnd.toISOString(),
        subscriptionId,
      },
    });
  }

  async getWorkflowRolloverParameters(subscriptionId: string): Promise<{
    stripeMeterId: string;
    tierQuantity: number;
    unitPriceCents: number;
  } | null> {
    const meteredDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscriptionId,
      );

    const workflowItem = meteredDetails.find(
      (item) => item.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!workflowItem) {
      this.logger.warn(
        `Workflow subscription item not found for subscription ${subscriptionId}`,
      );

      return null;
    }

    return {
      stripeMeterId: workflowItem.stripeMeterId,
      tierQuantity: workflowItem.tierQuantity,
      unitPriceCents: workflowItem.unitPriceCents,
    };
  }
}

