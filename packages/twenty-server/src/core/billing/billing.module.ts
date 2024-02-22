import { Module } from '@nestjs/common';

import { StripeModule } from '@golevelup/nestjs-stripe';

import { ProductPriceController } from 'src/core/billing/controllers/product-price.controller';
import stripeConfig from 'src/core/billing/stripe.config';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { BillingService } from 'src/core/billing/billing.service';

const stripeConfiguration = stripeConfig();
const metadata = stripeConfiguration.isSet
  ? {
      imports: [StripeModule.forRoot(StripeModule, stripeConfiguration.config)],
      controllers: [ProductPriceController],
      providers: [EnvironmentModule, BillingService],
    }
  : { imports: [] };

@Module(metadata)
export class BillingModule {}
