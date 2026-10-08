import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { WorkspaceQueryHookMetadataAccessor } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook-metadata.accessor';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { AgentChatThreadQueryHookModule } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-query-hook.module';

@Module({
  imports: [AgentChatThreadQueryHookModule, DiscoveryModule],
  providers: [
    WorkspaceQueryHookService,
    WorkspaceQueryHookExplorer,
    WorkspaceQueryHookMetadataAccessor,
    WorkspaceQueryHookStorage,
  ],
  exports: [WorkspaceQueryHookService],
})
export class WorkspaceQueryHookModule {}
