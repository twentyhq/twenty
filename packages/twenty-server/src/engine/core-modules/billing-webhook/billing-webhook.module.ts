import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingWebhookController } from 'src/engine/core-modules/billing-webhook/billing-webhook.controller';
import { BillingWebhookAlertService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-alert.service';
import { BillingWebhookCustomerService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-customer.service';
import { BillingWebhookEntitlementService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-entitlement.service';
import { BillingWebhookInvoiceService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-invoice.service';
import { BillingWebhookPriceService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-price.service';
import { BillingWebhookProductService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-product.service';
import { BillingWebhookSubscriptionScheduleService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-subscription-schedule.service';
import { BillingWebhookSubscriptionService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-subscription.service';
import { BillingWebhookCreditGrantService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-credit-grant.service';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingMeterEntity } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    FeatureFlagModule,
    StripeModule,
    MessageQueueModule,
    PermissionsModule,
    WorkspaceModule,
    BillingModule,
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
  ],
  controllers: [BillingWebhookController],
  providers: [
    BillingWebhookProductService,
    BillingWebhookPriceService,
    BillingWebhookAlertService,
    BillingWebhookInvoiceService,
    BillingWebhookCustomerService,
    BillingWebhookSubscriptionService,
    BillingWebhookSubscriptionScheduleService,
    BillingWebhookEntitlementService,
    BillingWebhookCreditGrantService,
  ],
})
export class BillingWebhookModule {}
