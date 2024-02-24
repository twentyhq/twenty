import { Module } from '@nestjs/common';

import { BillingController } from 'src/core/billing/billing.controller';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { BillingService } from 'src/core/billing/billing.service';
import { StripeModule } from 'src/core/billing/stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [BillingController],
  providers: [EnvironmentModule, BillingService],
})
export class BillingModule {}
