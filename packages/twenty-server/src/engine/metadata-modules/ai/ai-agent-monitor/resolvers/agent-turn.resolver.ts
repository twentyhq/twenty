import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentTurnDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-turn.dto';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentTurnEvaluationDTO } from 'src/engine/metadata-modules/ai/ai-agent-monitor/dtos/agent-turn-evaluation.dto';
import { RunEvaluationInputJob } from 'src/engine/metadata-modules/ai/ai-agent-monitor/jobs/run-evaluation-input.job';
import { AgentTurnGraderService } from 'src/engine/metadata-modules/ai/ai-agent-monitor/services/agent-turn-grader.service';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@Resolver()
export class AgentTurnResolver {
  private readonly logger = new Logger(AgentTurnResolver.name);

  constructor(
    @InjectRepository(AgentTurnEntity)
    private readonly turnRepository: Repository<AgentTurnEntity>,
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly graderService: AgentTurnGraderService,
  ) {}

  @Query(() => [AgentTurnDTO])
  async agentTurns(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
  ): Promise<AgentTurnDTO[]> {
    const turns = await this.turnRepository.find({
      where: { agentId },
      relations: ['evaluations', 'messages', 'messages.parts'],
      order: { createdAt: 'DESC' },
    });

    return turns;
  }

  @Mutation(() => AgentTurnEvaluationDTO)
  async evaluateAgentTurn(
    @Args('turnId', { type: () => UUIDScalarType }) turnId: string,
  ): Promise<AgentTurnEvaluationDTO> {
    const evaluation = await this.graderService.evaluateTurn(turnId);

    return evaluation;
  }

  @Mutation(() => AgentTurnDTO)
  async runEvaluationInput(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
    @Args('input') input: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AgentTurnDTO> {
    const thread = this.threadRepository.create({
      userWorkspaceId,
      title: `Eval: ${input.substring(0, 50)}...`,
    });
    const savedThread = await this.threadRepository.save(thread);

    const turn = this.turnRepository.create({
      threadId: savedThread.id,
      agentId,
    });
    const savedTurn = await this.turnRepository.save(turn);

    this.messageQueueService.add<{
      turnId: string;
      threadId: string;
      agentId: string;
      input: string;
      workspaceId: string;
    }>(RunEvaluationInputJob.name, {
      turnId: savedTurn.id,
      threadId: savedThread.id,
      agentId,
      input,
      workspaceId: workspace.id,
    });

    const turnWithRelations = await this.turnRepository.findOne({
      where: { id: savedTurn.id },
      relations: ['evaluations', 'messages', 'messages.parts'],
    });

    if (!turnWithRelations) {
      throw new NotFoundError('Turn not found after creation', {
        userFriendlyMessage: msg`Failed to create evaluation. Please try again.`,
      });
    }

    return turnWithRelations;
  }
}
