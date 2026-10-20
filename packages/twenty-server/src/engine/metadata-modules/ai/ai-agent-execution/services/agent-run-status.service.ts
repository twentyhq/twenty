import { Injectable } from '@nestjs/common';

import {
  type AgentRunEvent,
  type AgentRunStopReason,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { buildAgentRunStatusEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-status-event.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

export type AgentRunThreadStatus = Pick<
  AgentChatThreadWorkspaceEntity,
  'id' | 'activeStreamId' | 'pendingQuestionMessageId'
>;

type LatestAgentTurn = Pick<
  AgentTurnWorkspaceEntity,
  'id' | 'status' | 'error'
>;

@Injectable()
export class AgentRunStatusService {
  constructor(
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
  ) {}

  async buildCurrentStatusEvent({
    workspaceId,
    thread,
    streamingMessageId,
    lastMessageId,
  }: {
    workspaceId: string;
    thread: AgentRunThreadStatus;
    streamingMessageId: string | null;
    lastMessageId: string | null;
  }): Promise<AgentRunEvent> {
    if (isDefined(streamingMessageId)) {
      return buildAgentRunStatusEvent({
        sourceId: streamingMessageId,
        status: { type: 'session.status_running' },
      });
    }

    const latestTurn = await this.turnRecorderService.findLatestTurn({
      workspaceId,
      threadId: thread.id,
    });

    if (latestTurn?.status === AgentTurnStatus.FAILED) {
      return buildAgentRunStatusEvent({
        sourceId: latestTurn.id,
        status: {
          type: 'session.error',
          error: latestTurn.error ?? {
            code: AiExceptionCode.AGENT_EXECUTION_FAILED,
            message: 'The agent run failed',
          },
        },
      });
    }

    return buildAgentRunStatusEvent({
      sourceId: lastMessageId ?? thread.id,
      status: {
        type: 'session.status_idle',
        stopReason: await this.findStopReason({
          workspaceId,
          thread,
          latestTurn,
        }),
      },
    });
  }

  async resolveIdleStopReason({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<AgentRunStopReason> {
    const [thread, latestTurn] = await Promise.all([
      this.findThreadStatus({ workspaceId, threadId }),
      this.turnRecorderService.findLatestTurn({ workspaceId, threadId }),
    ]);

    return isDefined(thread)
      ? this.findStopReason({ workspaceId, thread, latestTurn })
      : 'end_turn';
  }

  findThreadStatus({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<AgentRunThreadStatus | null> {
    return this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'activeStreamId', 'pendingQuestionMessageId'],
    });
  }

  // a turn ending on a wait is recorded as waiting before the run arms its wake-up
  private async findStopReason({
    workspaceId,
    thread,
    latestTurn,
  }: {
    workspaceId: string;
    thread: AgentRunThreadStatus;
    latestTurn: LatestAgentTurn | null;
  }): Promise<AgentRunStopReason> {
    if (
      isDefined(thread.pendingQuestionMessageId) ||
      latestTurn?.status === AgentTurnStatus.WAITING_FOR_INPUT
    ) {
      return 'requires_action';
    }

    const { suspendedRun, hasPostedCall } =
      await this.agentRunSuspensionService.findConversationWait({
        workspaceId,
        threadId: thread.id,
      });

    return isDefined(suspendedRun) || hasPostedCall
      ? 'requires_action'
      : 'end_turn';
  }
}
