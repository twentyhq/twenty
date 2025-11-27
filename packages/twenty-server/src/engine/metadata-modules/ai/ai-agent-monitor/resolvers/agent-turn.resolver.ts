import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentTurnDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-turn.dto';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentTurnEvaluationDTO } from 'src/engine/metadata-modules/ai/ai-agent-monitor/dtos/agent-turn-evaluation.dto';
import { AgentTurnGraderService } from 'src/engine/metadata-modules/ai/ai-agent-monitor/services/agent-turn-grader.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@Resolver()
export class AgentTurnResolver {
  constructor(
    @InjectRepository(AgentTurnEntity)
    private readonly turnRepository: Repository<AgentTurnEntity>,
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly graderService: AgentTurnGraderService,
    private readonly aiAgentExecutorService: AgentAsyncExecutorService,
    private readonly agentChatService: AgentChatService,
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

    return turns as unknown as AgentTurnDTO[];
  }

  @Mutation(() => AgentTurnEvaluationDTO)
  async evaluateAgentTurn(
    @Args('turnId', { type: () => UUIDScalarType }) turnId: string,
  ): Promise<AgentTurnEvaluationDTO> {
    const evaluation = await this.graderService.evaluateTurn(turnId);

    return evaluation as unknown as AgentTurnEvaluationDTO;
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

    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });

    await this.agentChatService.addMessage({
      threadId: savedThread.id,
      turnId: savedTurn.id,
      uiMessage: {
        role: 'user',
        parts: [{ type: 'text', text: input }],
      },
    });

    const executionResult = await this.aiAgentExecutorService.executeAgent({
      agent,
      userPrompt: input,
    });

    await this.agentChatService.addMessage({
      threadId: savedThread.id,
      turnId: savedTurn.id,
      agentId: agent?.id,
      uiMessage: {
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: JSON.stringify(executionResult.result) || '',
          },
        ],
      },
    });

    await this.graderService.evaluateTurn(savedTurn.id);

    const turnWithEvaluations = await this.turnRepository.findOne({
      where: { id: savedTurn.id },
      relations: ['evaluations', 'messages', 'messages.parts'],
    });

    if (!turnWithEvaluations) {
      throw new Error('Turn not found after execution');
    }

    return turnWithEvaluations as unknown as AgentTurnDTO;
  }
}
