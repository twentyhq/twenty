import { Module } from '@nestjs/common';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';

@Module({
  providers: [StripeSDKService],
  exports: [StripeSDKService],
})
export class StripeSDKModule {}
