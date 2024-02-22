import { Module } from '@nestjs/common';

import { ProductPriceController } from 'src/core/billing/controllers/product-price.controller';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { BillingService } from 'src/core/billing/billing.service';
import { StripeModule } from 'src/core/billing/stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [ProductPriceController],
  providers: [EnvironmentModule, BillingService],
})
export class BillingModule {}
