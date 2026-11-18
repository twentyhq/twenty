import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { PushSubscriptionEntity } from 'src/engine/core-modules/web-push/push-subscription.entity';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { WebPushResolver } from 'src/engine/core-modules/web-push/web-push.resolver';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscriptionEntity]),
    UserSessionModule,
    SecureHttpClientModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(PushSubscriptionEntity),
    WebPushService,
    WebPushResolver,
  ],
  exports: [WebPushService],
})
export class WebPushModule {}
