import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WebPushSubscriptionEntity } from 'src/engine/core-modules/web-push/web-push-subscription.entity';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { WebPushResolver } from 'src/engine/core-modules/web-push/web-push.resolver';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebPushSubscriptionEntity, UserWorkspaceEntity]),
    UserSessionModule,
    SecureHttpClientModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(WebPushSubscriptionEntity),
    provideWorkspaceScopedRepository(UserWorkspaceEntity),
    WebPushService,
    WebPushResolver,
  ],
  exports: [WebPushService],
})
export class WebPushModule {}
