/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';

@Injectable()
export class BillingWebhookCreditGrantService {
  constructor(
    private readonly meteredCreditService: MeteredCreditService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
  ) {}

  async processStripeEvent(stripeCustomerId: string): Promise<void> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        stripeCustomerId,
      });

    if (!isDefined(subscription)) {
      return;
    }

    const meteredPricingInfo =
      await this.meteredCreditService.getMeteredPricingInfo(subscription.id);

    if (isDefined(meteredPricingInfo)) {
      const creditBalanceMicro =
        await this.meteredCreditService.getCreditBalance(
          stripeCustomerId,
          meteredPricingInfo.unitPriceCents,
        );

      await this.billingCustomerRepository.update(
        { stripeCustomerId },
        { creditBalanceMicro },
      );
    }

    await this.meteredCreditService.recreateBillingAlertForSubscription(
      subscription,
    );
  }
}
