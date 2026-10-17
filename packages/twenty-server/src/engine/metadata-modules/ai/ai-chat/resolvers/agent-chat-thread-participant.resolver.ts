import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { isAgentChatThreadFilterStatus } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentChatOpenThreadsSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-open-threads-summary.dto';
import { AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

// Unsubscribing is left out: it fails the whole batch on a chat assigned to
// the member, who cannot see that among chats they have not loaded
const INBOX_TAB_ACTIONS = new Set<AgentChatInboxAction>([
  AgentChatInboxAction.READ,
  AgentChatInboxAction.UNREAD,
  AgentChatInboxAction.ARCHIVE,
  AgentChatInboxAction.SNOOZE,
  AgentChatInboxAction.MOVE_TO_INBOX,
]);

const assertSnoozeTimeIsValid = ({
  action,
  snoozedUntil,
}: {
  action: AgentChatInboxAction;
  snoozedUntil: Date | null;
}) => {
  if (
    action === AgentChatInboxAction.SNOOZE &&
    (!isDefined(snoozedUntil) || snoozedUntil.getTime() <= Date.now())
  ) {
    throw new AiException(
      'Snooze time must be in the future',
      AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME,
    );
  }
};

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
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver(() => AgentChatThreadParticipantDTO)
export class AgentChatThreadParticipantResolver {
  constructor(
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly threadService: AgentChatThreadService,
  ) {}

  @Query(() => AgentChatOpenThreadsSummaryDTO)
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
  async updateAgentChatThreadInboxState(
    @Args('threadIds', { type: () => [UUIDScalarType] }) threadIds: string[],
    @Args('action', { type: () => AgentChatInboxAction })
    action: AgentChatInboxAction,
    @Args('snoozedUntil', { type: () => Date, nullable: true })
    snoozedUntil: Date | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO[]> {
    assertSnoozeTimeIsValid({ action, snoozedUntil });

    return this.participantService.updateInboxState({
      threadIds,
      action,
      snoozedUntil: snoozedUntil ?? null,
      workspaceMemberId,
      workspaceId,
    });
  }

  // Applies to every chat of an inbox tab but the excluded ones, for a
  // selection that reaches past the chats the member has loaded
  @Mutation(() => [AgentChatThreadParticipantDTO])
  async updateAgentChatThreadInboxStateInFilterStatus(
    @Args('filterStatus') filterStatus: string,
    @Args('excludedThreadIds', { type: () => [UUIDScalarType] })
    excludedThreadIds: string[],
    @Args('action', { type: () => AgentChatInboxAction })
    action: AgentChatInboxAction,
    @Args('snoozedUntil', { type: () => Date, nullable: true })
    snoozedUntil: Date | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO[]> {
    if (
      !isAgentChatThreadFilterStatus(filterStatus) ||
      !INBOX_TAB_ACTIONS.has(action)
    ) {
      throw new AiException(
        `Cannot apply ${action} to the chats in ${filterStatus}`,
        AiExceptionCode.INVALID_CHAT_INBOX_TAB_ACTION,
      );
    }

    assertSnoozeTimeIsValid({ action, snoozedUntil });

    return this.participantService.updateInboxStateInFilterStatus({
      filterStatus,
      excludedThreadIds,
      action,
      snoozedUntil: snoozedUntil ?? null,
      workspaceMemberId,
      workspaceId,
    });
  }

  // Clears the assignee when no member is given
  @Mutation(() => Boolean)
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
}
