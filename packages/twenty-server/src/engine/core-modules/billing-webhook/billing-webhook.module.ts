import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingWebhookController } from 'src/engine/core-modules/billing-webhook/billing-webhook.controller';
import { BillingWebhookAlertService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-alert.service';
import { BillingWebhookCustomerService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-customer.service';
import { BillingWebhookEntitlementService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-entitlement.service';
import { BillingWebhookInvoiceService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-invoice.service';
import { BillingWebhookPriceService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-price.service';
import { BillingWebhookProductService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-product.service';
import { BillingWebhookSubscriptionService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-subscription.service';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    FeatureFlagModule,
    StripeModule,
    DomainManagerModule,
    MessageQueueModule,
    PermissionsModule,
    WorkspaceModule,
    BillingModule,
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
  controllers: [BillingWebhookController],
  providers: [
    BillingWebhookProductService,
    BillingWebhookPriceService,
    BillingWebhookAlertService,
    BillingWebhookInvoiceService,
    BillingWebhookCustomerService,
    BillingWebhookSubscriptionService,
    BillingWebhookEntitlementService,
  ],
})
export class BillingWebhookModule {}
