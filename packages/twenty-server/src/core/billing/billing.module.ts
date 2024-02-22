import { Module } from '@nestjs/common';

import { StripeModule } from '@golevelup/nestjs-stripe';

import { PricesController } from 'src/core/billing/controllers/prices.controller';
import stripeConfig from 'src/core/billing/stripe.config';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';

const stripeConfiguration = stripeConfig();
const metadata = stripeConfiguration.isSet
  ? {
      imports: [StripeModule.forRoot(StripeModule, stripeConfiguration.config)],
      controllers: [PricesController],
      providers: [EnvironmentModule],
    }
  : { imports: [] };

@Module(metadata)
export class BillingModule {}
