import { Module } from '@nestjs/common';

import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { UrlManagerModule } from 'src/engine/core-modules/url-manager/url-manager.module';

@Module({
  imports: [UrlManagerModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
