import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Int, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentChatChannelDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel.dto';
import { AgentChatChannelRoleDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-role.dto';
import { AgentChatChannelSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-summary.dto';
import { AgentChatChannelThreadIdsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-thread-ids.dto';
import { AgentChatChannelAssignmentFilter } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-assignment-filter.enum';
import { AgentChatChannelThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-status.enum';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { CreateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/create-agent-chat-channel.input';
import { UpdateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/update-agent-chat-channel.input';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AgentChatChannelThreadsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-threads.service';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
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
    private readonly channelService: AgentChatChannelService,
    private readonly threadService: AgentChatThreadService,
    private readonly triageService: AgentChatThreadTriageService,
    private readonly channelThreadsService: AgentChatChannelThreadsService,
    private readonly permissionsService: PermissionsService,
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

  @Query(() => [AgentChatChannelDTO])
  async agentChatChannels(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<AgentChatChannelDTO[]> {
    const canManageChannels =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId,
        userWorkspaceId,
        setting: PermissionFlagType.AI_SETTINGS,
        applicationId: callingApplication?.id,
        agentId: undefined,
      });

    return this.channelService.findChannels({
      workspaceId,
      workspaceMemberId,
      canManageChannels,
    });
  }

  @Query(() => [AgentChatChannelRoleDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async agentChatChannelRoles(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelRoleDTO[]> {
    return this.channelService.findAssignableRoles(workspaceId);
  }

  @Mutation(() => AgentChatChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async createAgentChatChannel(
    @Args('input', { type: () => CreateAgentChatChannelInput })
    input: CreateAgentChatChannelInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelDTO> {
    return this.channelService.createChannel({
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      roleIds: input.roleIds,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async updateAgentChatChannel(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('input', { type: () => UpdateAgentChatChannelInput })
    input: UpdateAgentChatChannelInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelDTO> {
    return this.channelService.updateChannel({
      channelId,
      changes: {
        name: input.name ?? undefined,
        icon: input.icon,
        color: input.color,
        position: input.position ?? undefined,
        roleIds: input.roleIds ?? undefined,
      },
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
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
