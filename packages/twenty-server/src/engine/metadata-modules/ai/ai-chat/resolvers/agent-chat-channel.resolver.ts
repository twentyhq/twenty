import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentChatChannelMemberDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-member.dto';
import { AgentChatChannelDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel.dto';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { CreateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/create-agent-chat-channel.input';
import { UpdateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/update-agent-chat-channel.input';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
)
@MetadataResolver(() => AgentChatChannelDTO)
export class AgentChatChannelResolver {
  constructor(
    private readonly agentChatChannelService: AgentChatChannelService,
  ) {}

  @Query(() => [AgentChatChannelDTO])
  async chatChannels(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatChannelService.getChannelsForUser({
      userWorkspaceId,
      workspaceId,
    });
  }

  @Query(() => [AgentChatChannelMemberDTO])
  async chatChannelMembers(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatChannelService.getChannelMembersForUser({
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatChannelDTO)
  async createChatChannel(
    @Args('input') input: CreateAgentChatChannelInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatChannelService.createChannel({
      input,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatChannelDTO)
  async updateChatChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('input') input: UpdateAgentChatChannelInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatChannelService.updateChannel({
      channelId: id,
      input,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  async deleteChatChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.agentChatChannelService.deleteChannel({
      channelId: id,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatChannelMemberDTO)
  async joinChatChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatChannelService.joinChannel({
      channelId: id,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  async leaveChatChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.agentChatChannelService.leaveChannel({
      channelId: id,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatChannelMemberDTO)
  async addChatChannelMember(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('userWorkspaceId', { type: () => UUIDScalarType })
    userWorkspaceId: string,
    @AuthUserWorkspaceId() actorUserWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatChannelService.addMember({
      channelId,
      userWorkspaceId,
      actorUserWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  async removeChatChannelMember(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('userWorkspaceId', { type: () => UUIDScalarType })
    userWorkspaceId: string,
    @AuthUserWorkspaceId() actorUserWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.agentChatChannelService.removeMember({
      channelId,
      userWorkspaceId,
      actorUserWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async setChatThreadChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('channelId', { type: () => UUIDScalarType, nullable: true })
    channelId: string | null,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatChannelService.setThreadChannel({
      threadId,
      channelId: channelId ?? null,
      userWorkspaceId,
      workspaceId,
    });
  }
}
