import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingController } from 'src/core/billing/billing.controller';
import { BillingService } from 'src/core/billing/billing.service';
import { StripeModule } from 'src/core/billing/stripe/stripe.module';
import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/core/billing/entities/billing-subscription-item.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { BillingResolver } from 'src/core/billing/billing.resolver';
import { BillingWorkspaceMemberListener } from 'src/core/billing/listeners/billing-workspace-member.listener';
import { UserWorkspaceModule } from 'src/core/user-workspace/user-workspace.module';

@Module({
  imports: [
    StripeModule,
    UserWorkspaceModule,
    TypeOrmModule.forFeature(
      [BillingSubscription, BillingSubscriptionItem, Workspace],
      'core',
    ),
  ],
  controllers: [BillingController],
  providers: [BillingService, BillingResolver, BillingWorkspaceMemberListener],
  exports: [BillingService],
})
export class BillingModule {}
