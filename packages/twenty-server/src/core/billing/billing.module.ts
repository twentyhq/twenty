import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingController } from 'src/core/billing/billing.controller';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { BillingService } from 'src/core/billing/billing.service';
import { StripeModule } from 'src/core/billing/stripe/stripe.module';
import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/core/billing/entities/billing-subscription-item.entity';

@Module({
  imports: [
    StripeModule,
    TypeOrmModule.forFeature(
      [BillingSubscription, BillingSubscriptionItem],
      'core',
    ),
  ],
  controllers: [BillingController],
  providers: [EnvironmentModule, BillingService],
})
export class BillingModule {}
