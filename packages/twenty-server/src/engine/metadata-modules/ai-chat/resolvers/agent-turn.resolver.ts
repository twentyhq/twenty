import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentTurnGraderService } from 'src/engine/metadata-modules/ai-chat/services/agent-turn-grader.service';
import { AgentTurnEvaluationDTO } from 'src/engine/metadata-modules/ai-chat/dtos/agent-turn-evaluation.dto';
import { AgentTurnDTO } from 'src/engine/metadata-modules/ai-chat/dtos/agent-turn.dto';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai-chat/entities/agent-turn.entity';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@Resolver()
export class AgentTurnResolver {
  constructor(
    @InjectRepository(AgentTurnEntity)
    private readonly turnRepository: Repository<AgentTurnEntity>,
    private readonly graderService: AgentTurnGraderService,
  ) {}

  @Query(() => [AgentTurnDTO])
  async agentTurns(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
  ): Promise<AgentTurnDTO[]> {
    return this.turnRepository.find({
      where: { agentId },
      relations: ['evaluations', 'messages', 'messages.parts'],
      order: { createdAt: 'DESC' },
    });
  }

  @Mutation(() => AgentTurnEvaluationDTO)
  async evaluateAgentTurn(
    @Args('turnId', { type: () => UUIDScalarType }) turnId: string,
  ): Promise<AgentTurnEvaluationDTO> {
    return this.graderService.evaluateTurn(turnId);
  }
}
