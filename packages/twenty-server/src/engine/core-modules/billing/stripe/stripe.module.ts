/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { StripeProductService } from 'src/engine/core-modules/billing/stripe/services/stripe-product.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { StripeWebhookService } from 'src/engine/core-modules/billing/stripe/services/stripe-webhook.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';
import { StripeSDKModule } from 'src/engine/core-modules/billing/stripe/stripe-sdk/stripe-sdk.module';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';

@Module({
  imports: [
    DomainServerConfigModule,
    StripeSDKModule,
    TypeOrmModule.forFeature([BillingCustomerEntity]),
  ],
  providers: [
    StripeSubscriptionItemService,
    StripeWebhookService,
    StripeCheckoutService,
    StripeSubscriptionService,
    StripeSubscriptionScheduleService,
    StripeBillingPortalService,
    StripeBillingMeterService,
    StripeCustomerService,
    StripePriceService,
    StripeProductService,
    StripeBillingMeterEventService,
    StripeBillingAlertService,
    StripeCreditGrantService,
  ],
  exports: [
    StripeWebhookService,
    StripeBillingPortalService,
    StripeBillingMeterService,
    StripeCustomerService,
    StripePriceService,
    StripeCheckoutService,
    StripeSubscriptionItemService,
    StripeSubscriptionService,
    StripeProductService,
    StripeBillingMeterEventService,
    StripeSubscriptionScheduleService,
    StripeBillingAlertService,
    StripeCreditGrantService,
  ],
})
export class StripeModule {}
