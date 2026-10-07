import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

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

  @Mutation(() => AgentChatThreadParticipantDTO)
  async markAgentChatThreadAsRead(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.participantService.markAsRead({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadParticipantDTO)
  async markAgentChatThreadAsUnread(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.participantService.markAsUnread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadParticipantDTO)
  async archiveAgentChatThread(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.participantService.archive({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadParticipantDTO)
  async snoozeAgentChatThread(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('snoozedUntil', { type: () => Date }) snoozedUntil: Date,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.participantService.snooze({
      threadId,
      snoozedUntil,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadParticipantDTO)
  async moveAgentChatThreadToInbox(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.participantService.moveToInbox({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadParticipantDTO)
  async subscribeToAgentChatThread(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.participantService.subscribe({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadParticipantDTO)
  async unsubscribeFromAgentChatThread(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.participantService.unsubscribe({
      threadId,
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

  // Returns the members who were added, leaving out those who cannot reply in the chat
  @Mutation(() => [UUIDScalarType])
  async addAgentChatThreadParticipants(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('workspaceMemberIds', { type: () => [UUIDScalarType] })
    participantWorkspaceMemberIds: string[],
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string[]> {
    return this.threadService.addParticipants({
      threadId,
      participantWorkspaceMemberIds,
      workspaceMemberId,
      workspaceId,
    });
  }
}
