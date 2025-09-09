import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { WorkspaceQueryHookMetadataAccessor } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook-metadata.accessor';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { BlocklistQueryHookModule } from 'src/modules/blocklist/query-hooks/blocklist-query-hook.module';
import { CalendarQueryHookModule } from 'src/modules/calendar/common/query-hooks/calendar-query-hook.module';
import { ConnectedAccountQueryHookModule } from 'src/modules/connected-account/query-hooks/connected-account-query-hook.module';
import { DashboardQueryHookModule } from 'src/modules/dashboard/query-hooks/dashboard-query-hook.module';
import { MessagingQueryHookModule } from 'src/modules/messaging/common/query-hooks/messaging-query-hook.module';
import { WorkspaceMemberQueryHookModule } from 'src/modules/workspace-member/query-hooks/workspace-member-query-hook.module';

@Module({
  imports: [
    MessagingQueryHookModule,
    CalendarQueryHookModule,
    ConnectedAccountQueryHookModule,
    DashboardQueryHookModule,
    BlocklistQueryHookModule,
    WorkspaceMemberQueryHookModule,
    DiscoveryModule,
  ],
  providers: [
    WorkspaceQueryHookService,
    WorkspaceQueryHookExplorer,
    WorkspaceQueryHookMetadataAccessor,
    WorkspaceQueryHookStorage,
  ],
  exports: [WorkspaceQueryHookService],
})
export class WorkspaceQueryHookModule {}
