import { Injectable } from '@nestjs/common';

import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class AgentChatThreadTargetRecordDestroyListener {
  constructor(
    private readonly agentChatThreadTargetService: AgentChatThreadTargetService,
  ) {}

  // Deletion is the only lifecycle event that matters: a soft-deleted record can
  // be restored and should keep its conversations, but a destroyed one is gone
  // and its id may be issued again.
  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    await this.agentChatThreadTargetService.deleteTargetsForDestroyedRecords({
      workspaceId: payload.workspaceId,
      objectNameSingular: payload.objectMetadata.nameSingular,
      recordIds: payload.events.map(({ recordId }) => recordId),
    });
  }
}
