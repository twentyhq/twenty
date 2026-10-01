import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

// a listener rather than a destroy hook: destroys come from both the record API and chat mutations,
// and a destroy hook only sees the selected columns of a row that is already gone
@Injectable()
export class AgentChatThreadLifecycleListener {
  constructor(
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
  ) {}

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
