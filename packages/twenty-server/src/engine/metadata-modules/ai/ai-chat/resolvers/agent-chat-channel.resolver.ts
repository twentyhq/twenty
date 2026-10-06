import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Int, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentChatChannelDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel.dto';
import { AgentChatInboxSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-inbox-summary.dto';
import { AgentChatInboxThreadIdsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-inbox-thread-ids.dto';
import { AgentChatInboxViewInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-inbox-view.input';
import { CreateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/create-agent-chat-channel.input';
import { UpdateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/update-agent-chat-channel.input';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AgentChatInboxViewService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-view.service';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
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
@MetadataResolver(() => AgentChatChannelDTO)
export class AgentChatChannelResolver {
  constructor(
    private readonly channelService: AgentChatChannelService,
    private readonly threadService: AgentChatThreadService,
    private readonly triageService: AgentChatThreadTriageService,
    private readonly inboxViewService: AgentChatInboxViewService,
  ) {}

  @Query(() => AgentChatInboxThreadIdsDTO)
  async agentChatInboxThreadIds(
    @Args('view', { type: () => AgentChatInboxViewInput })
    view: AgentChatInboxViewInput,
    @Args('first', { type: () => Int, nullable: true }) first: number | null,
    @Args('after', { type: () => String, nullable: true }) after: string | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatInboxThreadIdsDTO> {
    return this.inboxViewService.findThreadIds({
      view,
      first,
      after,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Query(() => AgentChatInboxSummaryDTO)
  async agentChatInboxSummary(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatInboxSummaryDTO> {
    return this.inboxViewService.getSummary({ workspaceMemberId, workspaceId });
  }

  @Mutation(() => AgentChatChannelDTO)
  async createAgentChatChannel(
    @Args('input', { type: () => CreateAgentChatChannelInput })
    input: CreateAgentChatChannelInput,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelDTO> {
    return this.channelService.createChannel({
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      visibility: input.visibility,
      memberIds: input.memberIds,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatChannelDTO)
  async updateAgentChatChannel(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('input', { type: () => UpdateAgentChatChannelInput })
    input: UpdateAgentChatChannelInput,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelDTO> {
    return this.channelService.updateChannel({
      channelId,
      changes: {
        name: input.name ?? undefined,
        icon: input.icon,
        color: input.color,
        visibility: input.visibility ?? undefined,
      },
      workspaceMemberId,
      workspaceId,
    });
  }

  // A channel that still has chats needs somewhere to move them
  @Mutation(() => Boolean)
  async deleteAgentChatChannel(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('destinationChannelId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    destinationChannelId: string | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.channelService.deleteChannel({
      channelId,
      destinationChannelId: destinationChannelId ?? null,
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async joinAgentChatChannel(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.channelService.joinChannel({
      channelId,
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async leaveAgentChatChannel(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.channelService.removeMember({
      channelId,
      memberId: workspaceMemberId,
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async addAgentChatChannelMembers(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('workspaceMemberIds', { type: () => [UUIDScalarType] })
    memberIds: string[],
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.channelService.addMembers({
      channelId,
      memberIds,
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async removeAgentChatChannelMember(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('memberWorkspaceMemberId', { type: () => UUIDScalarType })
    memberId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.channelService.removeMember({
      channelId,
      memberId,
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  // Takes the chat out of any channel when none is given
  @Mutation(() => Boolean)
  async moveAgentChatThreadToChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('channelId', { type: () => UUIDScalarType, nullable: true })
    channelId: string | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.threadService.moveToChannel({
      threadId,
      channelId: channelId ?? null,
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async markAgentChatThreadAsDoneInChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.triageService.applyToChannelCopy({
      threadId,
      change: { type: 'DONE' },
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async snoozeAgentChatThreadInChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('snoozedUntil', { type: () => Date }) snoozedUntil: Date,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.triageService.applyToChannelCopy({
      threadId,
      change: { type: 'SNOOZE', snoozedUntil },
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async reopenAgentChatThreadInChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.triageService.applyToChannelCopy({
      threadId,
      change: { type: 'REOPEN' },
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }
}
