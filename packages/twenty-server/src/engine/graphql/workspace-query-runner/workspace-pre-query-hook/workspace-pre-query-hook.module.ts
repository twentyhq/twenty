import { Module } from '@nestjs/common';

import { MessagingQueryHookModule } from 'src/business/modules/message/query-hooks/messaging-query-hook.module';
import { WorkspacePreQueryHookService } from 'src/engine/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.service';

@Module({
  imports: [MessagingQueryHookModule],
  providers: [WorkspacePreQueryHookService],
  exports: [WorkspacePreQueryHookService],
})
export class WorkspacePreQueryHookModule {}
