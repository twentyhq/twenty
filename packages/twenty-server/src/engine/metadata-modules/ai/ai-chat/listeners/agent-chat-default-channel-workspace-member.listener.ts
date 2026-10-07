import { Injectable } from '@nestjs/common';

import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatDefaultChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-default-channel.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class AgentChatDefaultChannelWorkspaceMemberListener {
  constructor(
    private readonly defaultChannelService: AgentChatDefaultChannelService,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ): Promise<void> {
    for (const event of payload.events) {
      await this.defaultChannelService.addMemberToGeneral({
        workspaceId: payload.workspaceId,
        workspaceMemberId: event.recordId,
      });
    }
  }
}
