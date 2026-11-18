import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { PushSubscriptionEntity } from 'src/engine/core-modules/web-push/push-subscription.entity';
import { PushSubscriptionService } from 'src/engine/core-modules/web-push/services/push-subscription.service';
import { WebPushPresenceService } from 'src/engine/core-modules/web-push/services/web-push-presence.service';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { WebPushResolver } from 'src/engine/core-modules/web-push/web-push.resolver';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscriptionEntity]),
    UserSessionModule,
    SecureHttpClientModule,
    WorkspaceDomainsModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(PushSubscriptionEntity),
    PushSubscriptionService,
    WebPushPresenceService,
    WebPushService,
    WebPushResolver,
  ],
  exports: [WebPushService, WebPushPresenceService],
})
export class WebPushModule {}
