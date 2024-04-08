import { Module } from '@nestjs/common';

import { MessagingQueryHookModule } from 'src/modules/messaging/query-hooks/messaging-query-hook.module';
import { WorkspacePreQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.service';
import { CalendarQueryHookModule } from 'src/modules/calendar/query-hooks/calendar-query-hook.module';

@Module({
  imports: [MessagingQueryHookModule, CalendarQueryHookModule],
  providers: [WorkspacePreQueryHookService],
  exports: [WorkspacePreQueryHookService],
})
export class WorkspacePreQueryHookModule {}
