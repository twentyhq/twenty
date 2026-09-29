import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

// The destroy query hooks only see the columns the caller selected, and the
// row is gone by then, so the running stream is found in the event snapshot.
@Injectable()
export class AgentChatThreadDestroyedListener {
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
    }
  }
}
