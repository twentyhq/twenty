import { Module } from '@nestjs/common';

import { WorkspacePreQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.service';
import { CalendarQueryHookModule } from 'src/modules/calendar/query-hooks/calendar-query-hook.module';
import { ConnectedAccountQueryHookModule } from 'src/modules/connected-account/query-hooks/connected-account-query-hook.module';
import { MessagingQueryHookModule } from 'src/modules/messaging/common/query-hooks/messaging-query-hook.module';
import { WorkspaceMemberQueryHookModule } from 'src/modules/workspace-member/query-hooks/workspace-member-query-hook.module';

@Module({
  imports: [
    MessagingQueryHookModule,
    CalendarQueryHookModule,
    ConnectedAccountQueryHookModule,
    WorkspaceMemberQueryHookModule,
  ],
  providers: [WorkspacePreQueryHookService],
  exports: [WorkspacePreQueryHookService],
})
export class WorkspacePreQueryHookModule {}
