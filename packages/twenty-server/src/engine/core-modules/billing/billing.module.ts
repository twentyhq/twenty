import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingController } from 'src/engine/core-modules/billing/billing.controller';
import { BillingResolver } from 'src/engine/core-modules/billing/billing.resolver';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingWorkspaceMemberListener } from 'src/engine/core-modules/billing/listeners/billing-workspace-member.listener';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingWebhookService } from 'src/engine/core-modules/billing/services/billing-webhook.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [
    FeatureFlagModule,
    StripeModule,
    DomainManagerModule,
    TypeOrmModule.forFeature(
      [
        BillingSubscription,
        BillingSubscriptionItem,
        BillingCustomer,
        BillingProduct,
        BillingPrice,
        BillingMeter,
        BillingEntitlement,
        Workspace,
        UserWorkspace,
        FeatureFlagEntity,
      ],
      'core',
    ),
  ],
  controllers: [BillingController],
  providers: [
    BillingSubscriptionService,
    BillingWebhookService,
    BillingPortalWorkspaceService,
    BillingResolver,
    BillingWorkspaceMemberListener,
    BillingService,
  ],
  exports: [
    BillingSubscriptionService,
    BillingPortalWorkspaceService,
    BillingWebhookService,
    BillingService,
  ],
})
export class BillingModule {}
