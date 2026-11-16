import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { AGENT_RUNS_MAX_LIMIT } from 'src/engine/metadata-modules/ai/ai-agent-runs/constants/agent-runs-max-limit.constant';
import { type AgentRunDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-run.dto';
import { mapAgentTurnToAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-runs/utils/map-agent-turn-to-agent-run.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

@Injectable()
export class AgentRunsService {
  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly agentChatSharingService: AgentChatSharingService,
  ) {}

  // tool inputs and outputs can be large, so parts are read without them
  async findAgentRuns({
    workspaceId,
    workspaceMemberId,
    agentId,
    limit,
  }: {
    workspaceId: string;
    workspaceMemberId: string | undefined;
    agentId: string;
    limit: number;
  }): Promise<AgentRunDTO[]> {
    const turns = await this.turnRepository.find(workspaceId, {
      where: { agentId },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: Math.min(Math.max(limit, 1), AGENT_RUNS_MAX_LIMIT),
      relations: { thread: true },
    });

    const messages =
      turns.length > 0
        ? await this.messageRepository.find(workspaceId, {
            where: { turnId: In(turns.map((turn) => turn.id)) },
            select: ['id', 'turnId', 'role', 'agentId', 'createdAt'],
            order: { createdAt: 'ASC' },
          })
        : [];

    const parts =
      messages.length > 0
        ? await this.messagePartRepository.find(workspaceId, {
            where: { messageId: In(messages.map((message) => message.id)) },
            select: [
              'id',
              'messageId',
              'orderIndex',
              'type',
              'textContent',
              'toolName',
            ],
          })
        : [];

    const partsByMessageId = groupBy(parts, (part) => part.messageId);
    const messagesByTurnId = groupBy(messages, (message) => message.turnId);
    const readableThreadIds = await this.findReadableThreadIds({
      workspaceId,
      workspaceMemberId,
      threadIds: turns
        .filter(
          (turn) => isDefined(turn.thread) && !isDefined(turn.thread.deletedAt),
        )
        .map((turn) => turn.threadId)
        .filter(isDefined),
    });

    return turns.map((turn) => ({
      ...mapAgentTurnToAgentRun({
        ...turn,
        messages: (messagesByTurnId[turn.id] ?? []).map((message) => ({
          ...message,
          parts: partsByMessageId[message.id] ?? [],
        })),
      }),
      canReadThread:
        isDefined(turn.threadId) && readableThreadIds.has(turn.threadId),
    }));
  }

  // Conversations are private, while turns are listed to anyone managing the agent
  private async findReadableThreadIds({
    workspaceId,
    workspaceMemberId,
    threadIds,
  }: {
    workspaceId: string;
    workspaceMemberId: string | undefined;
    threadIds: string[];
  }): Promise<Set<string>> {
    if (!isDefined(workspaceMemberId) || threadIds.length === 0) {
      return new Set();
    }

    try {
      return new Set(
        await this.agentChatSharingService.findReadableThreadIds({
          workspaceId,
          workspaceMemberId,
          threadIds: [...new Set(threadIds)],
        }),
      );
    } catch (error) {
      // thrown when the member cannot use AI chat, which only means no conversation opens
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.THREAD_NOT_FOUND
      ) {
        return new Set();
      }
      throw error;
    }
  }
}
