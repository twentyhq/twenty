import { Module } from '@nestjs/common';

import { StripeService } from 'src/engine/features/billing/stripe/stripe.service';

@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
