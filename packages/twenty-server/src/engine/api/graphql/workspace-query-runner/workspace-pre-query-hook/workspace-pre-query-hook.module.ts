import { Module } from '@nestjs/common';

import { MessagingQueryHookModule } from 'src/modules/messaging/query-hooks/messaging-query-hook.module';
import { WorkspacePreQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.service';
import { CalendarQueryHookModule } from 'src/modules/calendar/query-hooks/calendar-query-hook.module';
import { ConnectedAccountQueryHookModule } from 'src/modules/connected-account/query-hooks/connected-account-query-hook.module';

@Module({
  imports: [
    MessagingQueryHookModule,
    CalendarQueryHookModule,
    ConnectedAccountQueryHookModule,
  ],
  providers: [WorkspacePreQueryHookService],
  exports: [WorkspacePreQueryHookService],
})
export class WorkspacePreQueryHookModule {}
