import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { WorkspaceQueryHookMetadataAccessor } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook-metadata.accessor';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { AppAccessQueryHookModule } from 'src/modules/app-access/query-hooks/app-access-query-hook.module';
import { BlocklistQueryHookModule } from 'src/modules/blocklist/query-hooks/blocklist-query-hook.module';
import { CalendarQueryHookModule } from 'src/modules/calendar/common/query-hooks/calendar-query-hook.module';
import { DashboardQueryHookModule } from 'src/modules/dashboard/query-hooks/dashboard-query-hook.module';
import { EpicQueryHookModule } from 'src/modules/epic/query-hooks/epic-query-hook.module';
import { IssueCommentQueryHookModule } from 'src/modules/issue-comment/query-hooks/issue-comment-query-hook.module';
import { IssueStatusQueryHookModule } from 'src/modules/issue-status/query-hooks/issue-status-query-hook.module';
import { IssueQueryHookModule } from 'src/modules/issue/query-hooks/issue-query-hook.module';
import { MessagingQueryHookModule } from 'src/modules/messaging/common/query-hooks/messaging-query-hook.module';
import { NoteQueryHookModule } from 'src/modules/note/query-hooks/note-query-hook.module';
import { ProjectQueryHookModule } from 'src/modules/project/query-hooks/project-query-hook.module';
import { ShiftQueryHookModule } from 'src/modules/shift/query-hooks/shift-query-hook.module';
import { SprintQueryHookModule } from 'src/modules/sprint/query-hooks/sprint-query-hook.module';
import { TaskQueryHookModule } from 'src/modules/task/query-hooks/task-query-hook.module';
import { TimelineQueryHookModule } from 'src/modules/timeline/query-hooks/timeline-query-hook.module';
import { WorkspaceMemberQueryHookModule } from 'src/modules/workspace-member/query-hooks/workspace-member-query-hook.module';

@Module({
  imports: [
    MessagingQueryHookModule,
    CalendarQueryHookModule,
    DashboardQueryHookModule,
    BlocklistQueryHookModule,
    WorkspaceMemberQueryHookModule,
    NoteQueryHookModule,
    TaskQueryHookModule,
    TimelineQueryHookModule,
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
