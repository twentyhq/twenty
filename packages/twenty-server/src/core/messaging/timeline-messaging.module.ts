import { Module } from '@nestjs/common';

import { TimelineMessagingResolver } from 'src/core/messaging/timeline-messaging.resolver';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';

@Module({
  imports: [DataSourceModule, TypeORMModule],
  exports: [],
  providers: [TimelineMessagingResolver],
})
export class TimelineMessagingModule {}
