import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { In } from 'typeorm';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AGENT_CHAT_TURN_STATUS_CHANGED_EVENT_NAME } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-chat-turn-status-changed-event-name.constant';
import { type AgentChatTurnStatusChangedEvent } from 'src/engine/metadata-modules/ai/ai-history/types/agent-chat-turn-status-changed-event.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Injectable()
export class AgentChatThreadRowMetadataListener {
  @Inject(AgentChatThreadRecordEventService)
  private readonly recordEventService: AgentChatThreadRecordEventService;
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  @OnEvent(AGENT_CHAT_TURN_STATUS_CHANGED_EVENT_NAME)
  async handleTurnStatusChanged({
    workspaceId,
    threadIds,
  }: AgentChatTurnStatusChangedEvent): Promise<void> {
    if (!isNonEmptyArray(threadIds)) {
      return;
    }

    const threads = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
            'agentChatThread',
            { shouldSkipEventEmission: true },
          );
        const where = { id: In([...new Set(threadIds)]) };
        const beforeById = new Map(
          (await repository.find({ where })).map((thread) => [
            thread.id,
            thread,
          ]),
        );
        await repository.update(where, { updatedAt: new Date().toISOString() });
        const after = await repository.find({ where });
        return after.flatMap((thread) => {
          const before = beforeById.get(thread.id);
          return isDefined(before) ? [{ before, after: thread }] : [];
        });
      },
      buildSystemAuthContext(workspaceId),
    );
    await this.recordEventService.emitThreadsUpdated({ workspaceId, threads });
  }
}
