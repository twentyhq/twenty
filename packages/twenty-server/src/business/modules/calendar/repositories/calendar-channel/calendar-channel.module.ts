import { Module } from '@nestjs/common';

import { CalendarChannelService } from 'src/business/modules/calendar/repositories/calendar-channel/calendar-channel.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarChannelService],
  exports: [CalendarChannelService],
})
export class CalendarChannelModule {}
