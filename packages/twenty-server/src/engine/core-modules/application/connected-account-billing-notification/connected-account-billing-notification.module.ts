import { Module } from '@nestjs/common';

import { ApplicationBillingPriceModule } from 'src/engine/core-modules/application/application-billing-price/application-billing-price.module';
import { ConnectedAccountBillingNotificationListener } from 'src/engine/core-modules/application/connected-account-billing-notification/connected-account-billing-notification.listener';
import { ConnectedAccountBillingNotificationService } from 'src/engine/core-modules/application/connected-account-billing-notification/connected-account-billing-notification.service';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApplicationBillingPriceModule,
    AgentChatThreadModule,
    PermissionsModule,
    WorkspaceCacheModule,
  ],
  providers: [
    ConnectedAccountBillingNotificationService,
    ConnectedAccountBillingNotificationListener,
  ],
})
export class ConnectedAccountBillingNotificationModule {}
