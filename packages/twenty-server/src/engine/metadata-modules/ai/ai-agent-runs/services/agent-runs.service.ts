import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { In } from 'typeorm';

import { AGENT_RUNS_MAX_LIMIT } from 'src/engine/metadata-modules/ai/ai-agent-runs/constants/agent-runs-max-limit.constant';
import { type AgentRunDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-run.dto';
import { mapAgentTurnToAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-runs/utils/map-agent-turn-to-agent-run.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryUpgradeFenceService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-upgrade-fence.service';
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
    private readonly upgradeFenceService: AgentHistoryUpgradeFenceService,
  ) {}

  // tool inputs and outputs can be large, so parts are read without them
  async findAgentRuns({
    workspaceId,
    agentId,
    limit,
  }: {
    workspaceId: string;
    agentId: string;
    limit: number;
  }): Promise<AgentRunDTO[]> {
    // a run is a turn's status, timing and creator, which a workspace the
    // 2.46 commands have not reached does not record
    if (
      !(await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId))
    ) {
      return [];
    }

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

    return turns.map((turn) =>
      mapAgentTurnToAgentRun({
        ...turn,
        messages: (messagesByTurnId[turn.id] ?? []).map((message) => ({
          ...message,
          parts: partsByMessageId[message.id] ?? [],
        })),
      }),
    );
  }
}
