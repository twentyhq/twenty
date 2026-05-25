/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BillingGaugeService } from 'src/engine/core-modules/billing/billing-gauge.service';
import { BillingResolver } from 'src/engine/core-modules/billing/billing.resolver';
import { BillingSyncCustomerDataCommand } from 'src/engine/core-modules/billing/commands/billing-sync-customer-data.command';
import { BillingSyncPlansDataCommand } from 'src/engine/core-modules/billing/commands/billing-sync-plans-data.command';
import { BillingUpdateSubscriptionPriceCommand } from 'src/engine/core-modules/billing/commands/billing-update-subscription-price.command';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingMeterEntity } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { BillingWorkspaceMemberListener } from 'src/engine/core-modules/billing/listeners/billing-workspace-member.listener';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ResourceCreditService } from 'src/engine/core-modules/billing/services/resource-credit.service';
import { WorkspaceBillingSubscriptionCacheService } from 'src/engine/core-modules/billing/services/workspace-billing-subscription-cache.service';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ClickHouseModule,
    FeatureFlagModule,
    StripeModule,
    MessageQueueModule,
    PermissionsModule,
    WorkspaceCacheModule,
    WorkspaceDomainsModule,
    TypeOrmModule.forFeature([
      BillingSubscriptionEntity,
      BillingSubscriptionItemEntity,
      BillingCustomerEntity,
      BillingProductEntity,
      BillingPriceEntity,
      BillingMeterEntity,
      BillingEntitlementEntity,
      WorkspaceEntity,
      UserWorkspaceEntity,
      FeatureFlagEntity,
    ]),
    MetricsModule,
    EnterpriseModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    BillingSubscriptionService,
    BillingSubscriptionUpdateService,
    BillingSubscriptionItemService,
    BillingPortalWorkspaceService,
    BillingProductService,
    BillingSubscriptionPhaseService,
    BillingResolver,
    BillingPlanService,
    BillingWorkspaceMemberListener,
    BillingService,
    BillingRestApiExceptionFilter,
    BillingSyncCustomerDataCommand,
    BillingUpdateSubscriptionPriceCommand,
    BillingSyncPlansDataCommand,
    BillingUsageService,
    BillingUsageCapService,
    BillingPriceService,
    BillingCreditRolloverService,
    ResourceCreditService,
    BillingGaugeService,
    WorkspaceBillingSubscriptionCacheService,
  ],
  exports: [
    BillingSubscriptionService,
    BillingSubscriptionUpdateService,
    BillingSubscriptionItemService,
    BillingSubscriptionPhaseService,
    BillingPortalWorkspaceService,
    BillingService,
    BillingUsageService,
    BillingUsageCapService,
    BillingCreditRolloverService,
    ResourceCreditService,
  ],
})
export class BillingModule {}
