/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { EventLogEmitterResolver } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.resolver';
import { EventLogLiveModule } from 'src/engine/core-modules/event-logs/live/event-log-live.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

import { EventLogsLiveResolver } from './event-logs-live.resolver';
import { EventLogsResolver } from './event-logs.resolver';
import { EventLogsService } from './event-logs.service';

@Module({
  imports: [
    ClickHouseModule,
    PermissionsModule,
    BillingModule,
    EnterpriseModule,
    GuardRedirectModule,
    JwtModule,
    EventLogLiveModule,
    EventLogEmitterModule,
    SubscriptionsModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
  providers: [
    EventLogsResolver,
    EventLogsLiveResolver,
    EventLogsService,
    EventLogEmitterResolver,
  ],
  exports: [EventLogsService],
})
export class EventLogsViewerModule {}
