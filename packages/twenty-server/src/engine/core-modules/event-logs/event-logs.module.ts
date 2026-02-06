/* @license Enterprise */

import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { EventLogsResolver } from './event-logs.resolver';
import { EventLogsService } from './event-logs.service';

@Module({
  imports: [
    ClickHouseModule,
    PermissionsModule,
    BillingModule,
    GuardRedirectModule,
  ],
  providers: [EventLogsResolver, EventLogsService],
  exports: [EventLogsService],
})
export class EventLogsModule {}
