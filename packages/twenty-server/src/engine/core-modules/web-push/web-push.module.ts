import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { WebPushSubscriptionEntity } from 'src/engine/core-modules/web-push/web-push-subscription.entity';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { WebPushResolver } from 'src/engine/core-modules/web-push/web-push.resolver';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebPushSubscriptionEntity]),
    UserSessionModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(WebPushSubscriptionEntity),
    WebPushService,
    WebPushResolver,
  ],
})
export class WebPushModule {}
