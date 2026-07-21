import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { TimelineCalendarEventResolver } from 'src/engine/core-modules/calendar/timeline-calendar-event.resolver';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RelatedPersonIdsModule } from 'src/engine/core-modules/related-person-ids/related-person-ids.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';

@Module({
  imports: [
    FileUrlModule,
    UserModule,
    RelatedPersonIdsModule,
    TypeOrmModule.forFeature([
      CalendarChannelEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
  ],
  exports: [],
  providers: [TimelineCalendarEventResolver, TimelineCalendarEventService],
})
export class TimelineCalendarEventModule {}
