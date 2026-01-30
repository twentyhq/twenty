import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

import { EventLogsResolver } from './event-logs.resolver';
import { EventLogsService } from './event-logs.service';

@Module({
  imports: [ClickHouseModule, PermissionsModule, TwentyORMModule],
  providers: [EventLogsResolver, EventLogsService],
  exports: [EventLogsService],
})
export class EventLogsModule {}
