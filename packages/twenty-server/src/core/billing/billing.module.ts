import { Module } from '@nestjs/common';

import { StripeModule } from '@golevelup/nestjs-stripe';

import { ProductController } from 'src/core/billing/controllers/product.controller';
import stripeConfig from 'src/core/billing/stripe-config';

@Module({
  imports: [StripeModule.forRoot(StripeModule, stripeConfig())],
  controllers: [ProductController],
})
export class BillingModule {}
