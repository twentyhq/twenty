import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NonNegative } from 'type-fest';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class BillingMeterEventService {
  protected readonly logger = new Logger(BillingMeterEventService.name);
  constructor(
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async hasActiveBillingSubscription(workspaceId: string): Promise<boolean> {
    const activeWorkspaceSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        {
          workspaceId,
        },
      );

    return !!activeWorkspaceSubscription;
  }

  async sendBillingMeterEvent({
    workspaceId,
    eventName,
    value,
  }: {
    workspaceId: string;
    eventName: BillingMeterEventName;
    value: NonNegative<number>;
  }) {
    const isBillingPlansEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsBillingPlansEnabled,
        workspaceId,
      );

    if (!isBillingPlansEnabled) {
      return;
    }

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
    const hasActiveBillingSubscription =
      await this.hasActiveBillingSubscription(workspaceId);

    if (!hasActiveBillingSubscription) {
      throw new BillingException(
        'No active billing subscription found',
        BillingExceptionCode.BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND,
      );
    }

    try {
      await this.stripeBillingMeterEventService.sendBillingMeterEvent({
        eventName,
        value,
        stripeCustomerId: workspaceStripeCustomer.stripeCustomerId,
      });
    } catch (error) {
      throw new BillingException(
        'Failed to send billing meter event to Stripe API',
        BillingExceptionCode.BILLING_METER_EVENT_FAILED,
      );
    }
  }
}
