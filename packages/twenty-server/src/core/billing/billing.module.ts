import { Module } from '@nestjs/common';

import { ProductPriceController } from 'src/core/billing/controllers/product-price.controller';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { BillingService } from 'src/core/billing/billing.service';
import { StripeModule } from 'src/core/billing/stripe/stripe.module';
import { BillingResolver } from 'src/core/billing/billing.resolver';
import { CheckoutSessionController } from 'src/core/billing/controllers/checkout-session.controller';

@Module({
  imports: [StripeModule],
  controllers: [ProductPriceController, CheckoutSessionController],
  providers: [EnvironmentModule, BillingService, BillingResolver],
})
export class BillingModule {}
