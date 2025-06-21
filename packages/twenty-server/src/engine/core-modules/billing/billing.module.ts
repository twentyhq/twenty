/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { BillingResolver } from 'src/engine/core-modules/billing/billing.resolver';
import { BillingAddWorkflowSubscriptionItemCommand } from 'src/engine/core-modules/billing/commands/billing-add-workflow-subscription-item.command';
import { BillingSyncCustomerDataCommand } from 'src/engine/core-modules/billing/commands/billing-sync-customer-data.command';
import { BillingSyncPlansDataCommand } from 'src/engine/core-modules/billing/commands/billing-sync-plans-data.command';
import { BillingUpdateSubscriptionPriceCommand } from 'src/engine/core-modules/billing/commands/billing-update-subscription-price.command';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { BillingFeatureUsedListener } from 'src/engine/core-modules/billing/listeners/billing-feature-used.listener';
import { BillingWorkspaceMemberListener } from 'src/engine/core-modules/billing/listeners/billing-workspace-member.listener';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    FeatureFlagModule,
    StripeModule,
    DomainManagerModule,
    MessageQueueModule,
    PermissionsModule,
    AiModule,
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
        FeatureFlag,
      ],
      'core',
    ),
  ],
  providers: [
    BillingSubscriptionService,
    BillingSubscriptionItemService,
    BillingPortalWorkspaceService,
    BillingProductService,
    BillingResolver,
    BillingPlanService,
    BillingWorkspaceMemberListener,
    BillingFeatureUsedListener,
    BillingService,
    BillingRestApiExceptionFilter,
    BillingSyncCustomerDataCommand,
    BillingUpdateSubscriptionPriceCommand,
    BillingSyncPlansDataCommand,
    BillingAddWorkflowSubscriptionItemCommand,
    BillingUsageService,
  ],
  exports: [
    BillingSubscriptionService,
    BillingPortalWorkspaceService,
    BillingService,
    BillingUsageService,
  ],
})
export class BillingModule {}
