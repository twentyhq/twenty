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
import { AgentChatChannelSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-summary.dto';
import { AgentChatChannelThreadIdsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-thread-ids.dto';
import { AgentChatChannelAssignmentFilter } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-assignment-filter.enum';
import { AgentChatChannelThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-status.enum';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { AgentChatChannelThreadsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-threads.service';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

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
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  AiGraphqlApiExceptionInterceptor,
)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver(() => AgentChatChannelDTO)
export class AgentChatChannelResolver {
  constructor(
    private readonly threadService: AgentChatThreadService,
    private readonly triageService: AgentChatThreadTriageService,
    private readonly channelThreadsService: AgentChatChannelThreadsService,
  ) {}

  @Query(() => AgentChatChannelThreadIdsDTO)
  async agentChatChannelThreadIds(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('status', {
      type: () => AgentChatChannelThreadStatus,
      nullable: true,
    })
    status: AgentChatChannelThreadStatus | null,
    @Args('assignment', {
      type: () => AgentChatChannelAssignmentFilter,
      nullable: true,
    })
    assignment: AgentChatChannelAssignmentFilter | null,
    @Args('first', { type: () => Int, nullable: true }) first: number | null,
    @Args('after', { type: () => String, nullable: true }) after: string | null,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelThreadIdsDTO> {
    return this.channelThreadsService.findThreadIds({
      channelId,
      status,
      assignment,
      first,
      after,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Query(() => [AgentChatChannelSummaryDTO])
  async agentChatChannelSummaries(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelSummaryDTO[]> {
    return this.channelThreadsService.findSummaries({
      workspaceMemberId,
      workspaceId,
    });
  }

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
      change: { action: AgentChatInboxAction.ARCHIVE },
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
      change: { action: AgentChatInboxAction.SNOOZE, snoozedUntil },
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
      change: { action: AgentChatInboxAction.MOVE_TO_INBOX },
      workspaceMemberId,
      workspaceId,
    });

    return true;
  }
}
