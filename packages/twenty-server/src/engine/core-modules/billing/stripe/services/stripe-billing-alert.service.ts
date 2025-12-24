import { Injectable, Logger } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { type StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
import { type StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';

@Injectable()
export class StripeBillingAlertService {
  protected readonly logger = new Logger(StripeBillingAlertService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
    private readonly stripeBillingMeterService: StripeBillingMeterService,
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async createUsageThresholdAlertForCustomerMeter(
    customerId: string,
    tierCap: number,
    creditBalance: number = 0,
  ): Promise<void> {
    const meter = (await this.stripeBillingMeterService.getAllMeters()).find(
      (meterItem) => {
        return meterItem.event_name === BillingMeterEventName.WORKFLOW_NODE_RUN;
      },
    );

    assertIsDefinedOrThrow(meter);

    await this.archiveAlertsForCustomer(customerId, meter.id);

    const cumulativeUsage =
      await this.stripeBillingMeterEventService.getTotalCumulativeUsage(
        meter.id,
        customerId,
      );

    // Include credit balance (rollover credits) in the threshold
    const dynamicThreshold = cumulativeUsage + tierCap + creditBalance;

    await this.stripe.billing.alerts.create({
      alert_type: 'usage_threshold',
      title: `Usage cap for customer ${customerId}`,
      usage_threshold: {
        gte: dynamicThreshold,
        meter: meter.id,
        recurrence: 'one_time',
        filters: [
          {
            type: 'customer',
            customer: customerId,
          },
        ],
      },
    });

    this.logger.log(
      `Created billing alert for customer ${customerId}: threshold=${dynamicThreshold} (cumulative=${cumulativeUsage} + tierCap=${tierCap} + creditBalance=${creditBalance})`,
    );
  }

  private async archiveAlertsForCustomer(
    customerId: string,
    meterId: string,
  ): Promise<void> {
    const alerts = await this.stripe.billing.alerts.list({
      meter: meterId,
    });

    const customerAlerts = alerts.data.filter(
      (alert) =>
        alert.status === 'active' &&
        alert.usage_threshold?.filters?.some(
          (filter) =>
            filter.type === 'customer' && filter.customer === customerId,
        ),
    );

    for (const alert of customerAlerts) {
      await this.stripe.billing.alerts.archive(alert.id);
      this.logger.log(`Archived alert ${alert.id} for customer ${customerId}`);
    }
  }
}
