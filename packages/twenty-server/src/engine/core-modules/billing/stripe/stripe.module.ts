/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { StripeProductService } from 'src/engine/core-modules/billing/stripe/services/stripe-product.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { StripeWebhookService } from 'src/engine/core-modules/billing/stripe/services/stripe-webhook.service';
import { StripeSDKModule } from 'src/engine/core-modules/billing/stripe/stripe-sdk/stripe-sdk.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [
    DomainManagerModule,
    StripeSDKModule,
    TypeOrmModule.forFeature([BillingCustomer], 'core'),
  ],
  providers: [
    StripeSubscriptionItemService,
    StripeWebhookService,
    StripeCheckoutService,
    StripeSubscriptionService,
    StripeBillingPortalService,
    StripeBillingMeterService,
    StripeCustomerService,
    StripePriceService,
    StripeProductService,
    StripeBillingMeterEventService,
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
  ],
})
export class StripeModule {}
