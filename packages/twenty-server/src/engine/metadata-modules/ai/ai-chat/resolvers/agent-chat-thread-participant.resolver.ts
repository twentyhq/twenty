import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AddAgentChatThreadParticipantsInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/add-agent-chat-thread-participants.input';
import { AgentChatOpenThreadsSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-open-threads-summary.dto';
import { AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const USER_SESSION_PRINCIPALS = {
  standard: true,
  impersonated: true,
  playground: true,
  workspaceAgnostic: false,
};

const AGENT_CHAT_THREAD_PARTICIPANT_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: USER_SESSION_PRINCIPALS,
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  },
  requiredPermissionFlags: [PermissionFlagType.AI],
};

const ADD_AGENT_CHAT_THREAD_PARTICIPANTS_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: USER_SESSION_PRINCIPALS,
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.AI],
};

@UsePipes(ResolverValidationPipe)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver(() => AgentChatThreadParticipantDTO)
export class AgentChatThreadParticipantResolver {
  constructor(
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly threadService: AgentChatThreadService,
    private readonly triageService: AgentChatThreadTriageService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
  ) {}

  @Query(() => AgentChatOpenThreadsSummaryDTO)
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_THREAD_PARTICIPANT_ACCESS_POLICY))
  async agentChatOpenThreadsSummary(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatOpenThreadsSummaryDTO> {
    return this.participantService.findOpenThreadsSummary({
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => [AgentChatThreadParticipantDTO])
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_THREAD_PARTICIPANT_ACCESS_POLICY))
  async updateAgentChatThreadInboxState(
    @Args('threadIds', { type: () => [UUIDScalarType] }) threadIds: string[],
    @Args('action', { type: () => AgentChatInboxAction })
    action: AgentChatInboxAction,
    @Args('snoozedUntil', { type: () => Date, nullable: true })
    snoozedUntil: Date | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO[]> {
    if (
      action === AgentChatInboxAction.SNOOZE &&
      (!isDefined(snoozedUntil) || snoozedUntil.getTime() <= Date.now())
    ) {
      throw new AiException(
        'Snooze time must be in the future',
        AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME,
      );
    }

    return this.triageService.updateInboxState({
      threadIds,
      action,
      snoozedUntil: snoozedUntil ?? null,
      workspaceMemberId,
      workspaceId,
    });
  }

  // Clears the assignee when no member is given
  @Mutation(() => Boolean)
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_THREAD_PARTICIPANT_ACCESS_POLICY))
  async assignAgentChatThread(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('assigneeWorkspaceMemberId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    assigneeWorkspaceMemberId: string | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.threadService.assign({
      threadId,
      assigneeWorkspaceMemberId: assigneeWorkspaceMemberId ?? null,
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => [UUIDScalarType])
  @UseGuards(
    AccessPolicyGuard(ADD_AGENT_CHAT_THREAD_PARTICIPANTS_ACCESS_POLICY),
  )
  async addAgentChatThreadParticipants(
    @Args('input')
    { threadId, workspaceMemberIds }: AddAgentChatThreadParticipantsInputDTO,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string[]> {
    return this.inboxDeliveryService.deliverThreadToMemberInboxes({
      threadId,
      workspaceMemberIds,
      workspaceMemberId,
      workspaceId,
      reason: AgentChatInboxDeliveryReason.RECIPIENT,
    });
  }
}
