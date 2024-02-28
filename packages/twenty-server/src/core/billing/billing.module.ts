import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingController } from 'src/core/billing/billing.controller';
import { BillingService } from 'src/core/billing/billing.service';
import { StripeModule } from 'src/core/billing/stripe/stripe.module';
import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/core/billing/entities/billing-subscription-item.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { BillingResolver } from 'src/core/billing/billing.resolver';

@Module({
  imports: [
    StripeModule,
    TypeOrmModule.forFeature(
      [BillingSubscription, BillingSubscriptionItem, Workspace],
      'core',
    ),
  ],
  controllers: [BillingController],
  providers: [BillingService, BillingResolver],
})
export class BillingModule {}
