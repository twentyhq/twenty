import { Module } from '@nestjs/common';

import { CalendarChannelEventAssociationService } from 'src/business/modules/calendar/repositories/calendar-channel-event-association/calendar-channel-event-association.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarChannelEventAssociationService],
  exports: [CalendarChannelEventAssociationService],
})
export class CalendarChannelEventAssociationModule {}
