import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { Args, Mutation, Query, Parent, ResolveField } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AgentTurnDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-turn.dto';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { AgentTurnEvaluationDTO } from 'src/engine/metadata-modules/ai/ai-agent-monitor/dtos/agent-turn-evaluation.dto';
import { RunEvaluationInputJob } from 'src/engine/metadata-modules/ai/ai-agent-monitor/jobs/run-evaluation-input.job';
import { AgentTurnGraderService } from 'src/engine/metadata-modules/ai/ai-agent-monitor/services/agent-turn-grader.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS),
)
@MetadataResolver(() => AgentTurnDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AgentTurnResolver {
  private readonly logger = new Logger(AgentTurnResolver.name);

  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly graderService: AgentTurnGraderService,
    private readonly agentService: AgentService,
  ) {}

  @ResolveField(() => Date)
  createdAt(@Parent() turn: AgentTurnWorkspaceEntity): Date {
    return new Date(turn.createdAt);
  }

  @ResolveField(() => [AgentTurnEvaluationDTO])
  evaluations(
    @Parent() turn: AgentTurnWorkspaceEntity,
  ): AgentTurnEvaluationDTO[] {
    return (turn.evaluations ?? []).map((evaluation) => ({
      ...evaluation,
      createdAt: new Date(evaluation.createdAt),
    }));
  }

  @Query(() => [AgentTurnDTO])
  async agentTurns(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentTurnWorkspaceEntity[]> {
    return this.turnRepository.find(workspaceId, {
      where: { agentId },
      relations: ['evaluations', 'messages', 'messages.parts'],
      order: { createdAt: 'DESC' },
    });
  }

  @Mutation(() => AgentTurnEvaluationDTO)
  async evaluateAgentTurn(
    @Args('turnId', { type: () => UUIDScalarType }) turnId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentTurnEvaluationDTO> {
    const evaluation = await this.graderService.evaluateTurn({
      turnId,
      workspaceId,
    });
    return { ...evaluation, createdAt: new Date(evaluation.createdAt) };
  }

  @Mutation(() => AgentTurnDTO)
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: { withUser: true, withoutUser: false },
      application: { withUser: true, withoutUser: false },
    }),
  )
  async runEvaluationInput(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
    @Args('input') input: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AgentTurnWorkspaceEntity> {
    // Defense in depth: the job also re-fetches the agent through a
    // workspace-scoped repository.
    await this.agentService.findOneAgentById({
      id: agentId,
      workspaceId: workspace.id,
    });

    // Evaluation history stays outside the user's chat list: no share or broadcast.
    const savedThread = await this.threadRepository.insertAndReturnOne(
      workspace.id,
      {
        workspaceMemberId,
        userWorkspaceId,
        title: `Eval: ${input.substring(0, 50)}...`,
      },
    );

    const savedTurn = await this.turnRepository.insertAndReturnOne(
      workspace.id,
      {
        threadId: savedThread.id,
        agentId,
      },
    );

    await this.messageQueueService.add<{
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

    const turnWithRelations = await this.turnRepository.findOne(workspace.id, {
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
