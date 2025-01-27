import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
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
  ) {}

  async sendBillingMeterEvent({
    workspaceId,
    eventName,
    value,
  }: {
    workspaceId: string;
    eventName: BillingMeterEventName;
    value: number;
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

    await this.stripeBillingMeterEventService.sendBillingMeterEvent({
      eventName,
      value,
      stripeCustomerId: workspaceStripeCustomer.stripeCustomerId,
    });
  }
}
