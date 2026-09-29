import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

// Archiving and destroying reach here from both the record API and the chat
// mutations, so the running stream and the sandbox are released in one place
@Injectable()
export class AgentChatThreadLifecycleListener {
  constructor(
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
  ) {}

  @OnDatabaseBatchEvent('agentChatThread', DatabaseEventAction.UPDATED)
  async handleUpdatedThreads(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity>
    >,
  ): Promise<void> {
    for (const event of payload.events) {
      const { before, after } = event.properties;

      if (isDefined(before.archivedAt) || !isDefined(after.archivedAt)) {
        continue;
      }

      await this.threadLifecycleService.stopStreamIfAny({
        workspaceId: payload.workspaceId,
        thread: after,
      });
      this.threadLifecycleService.releaseThreadSandboxBestEffort({
        workspaceId: payload.workspaceId,
        threadId: after.id,
      });
    }
  }

  @OnDatabaseBatchEvent('agentChatThread', DatabaseEventAction.DESTROYED)
  async handleDestroyedThreads(
    payload: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<AgentChatThreadWorkspaceEntity>
    >,
  ): Promise<void> {
    for (const event of payload.events) {
      const { id, activeStreamId } = event.properties.before;

      if (isNonEmptyString(activeStreamId)) {
        await this.threadLifecycleService.cancelStream({
          threadId: id,
          streamId: activeStreamId,
        });
      }
      this.threadLifecycleService.releaseThreadSandboxBestEffort({
        workspaceId: payload.workspaceId,
        threadId: id,
      });
    }
  }
}
