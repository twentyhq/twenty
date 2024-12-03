import { Module } from '@nestjs/common';

import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [DomainManagerModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
