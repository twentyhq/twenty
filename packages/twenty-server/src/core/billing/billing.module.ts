import { Module } from '@nestjs/common';

import { ProductPriceController } from 'src/core/billing/controllers/product-price.controller';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { BillingService } from 'src/core/billing/billing.service';
import { StripeModule } from 'src/core/billing/stripe/stripe.module';
import { CheckoutSessionController } from 'src/core/billing/controllers/checkout-session.controller';

@Module({
  imports: [StripeModule],
  controllers: [ProductPriceController, CheckoutSessionController],
  providers: [EnvironmentModule, BillingService],
})
export class BillingModule {}
