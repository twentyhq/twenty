/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class BillingUsageService {
  protected readonly logger = new Logger(BillingUsageService.name);
  constructor(
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async canFeatureBeUsed(workspaceId: string): Promise<boolean> {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return true;
    }

    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        {
          workspaceId,
        },
      );

    if (!billingSubscription) {
      return false;
    }

    return true;
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
}
