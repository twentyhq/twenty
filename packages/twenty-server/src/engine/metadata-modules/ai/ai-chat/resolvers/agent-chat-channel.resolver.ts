import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AgentChatChannelDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel.dto';
import { AgentChatChannelRoleDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-role.dto';
import { AgentChatChannelSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-summary.dto';
import { AgentChatChannelThreadIdsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-thread-ids.dto';
import { AgentChatChannelAssignmentFilter } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-assignment-filter.enum';
import { AgentChatChannelThreadFilter } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-filter.enum';
import { AgentChatChannelThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-status.enum';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { CreateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/create-agent-chat-channel.input';
import { UpdateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/update-agent-chat-channel.input';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AgentChatChannelThreadsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-threads.service';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { getAgentInboxCallerAuthContextOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-inbox-caller-auth-context-or-throw.util';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { IS_CUSTOM_DEPRECATION_REASON } from 'src/engine/metadata-modules/utils/constants/is-custom-deprecation-reason.constant';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const AGENT_CHAT_CHANNEL_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: true },
  },
  requiredPermissionFlags: [PermissionFlagType.AI],
};

const AGENT_CHAT_CHANNEL_SETTINGS_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  },
  requiredPermissionFlags: [
    PermissionFlagType.AI,
    PermissionFlagType.AI_SETTINGS,
  ],
};

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
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  @ResolveField(() => Boolean, {
    deprecationReason: IS_CUSTOM_DEPRECATION_REASON,
  })
  isCustom(
    @Parent() channel: AgentChatChannelDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): boolean {
    return channel.applicationId === workspace.workspaceCustomApplicationId;
  }

  @Query(() => AgentChatChannelThreadIdsDTO)
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_ACCESS_POLICY))
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
    @Args('filter', {
      type: () => AgentChatChannelThreadFilter,
      nullable: true,
    })
    filter: AgentChatChannelThreadFilter | null,
    @Args('first', { type: () => Int, nullable: true }) first: number | null,
    @Args('after', { type: () => String, nullable: true }) after: string | null,
  ): Promise<AgentChatChannelThreadIdsDTO> {
    return this.channelThreadsService.findThreadIds({
      channelId,
      status,
      assignment,
      filter,
      first,
      after,
      authContext: getAgentInboxCallerAuthContextOrThrow(),
    });
  }

  @Query(() => [AgentChatChannelSummaryDTO])
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_ACCESS_POLICY))
  async agentChatChannelSummaries(): Promise<AgentChatChannelSummaryDTO[]> {
    return this.channelThreadsService.findSummaries({
      authContext: getAgentInboxCallerAuthContextOrThrow(),
    });
  }

  @Query(() => [AgentChatChannelDTO])
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_ACCESS_POLICY))
  async agentChatChannels(): Promise<AgentChatChannelDTO[]> {
    const authContext = getAgentInboxCallerAuthContextOrThrow();

    return this.channelService.findChannels({
      authContext,
      canManageChannels: await this.settingPermissionsService.hasPermissionFlag(
        {
          authContext,
          permissionFlag: PermissionFlagType.AI_SETTINGS,
        },
      ),
    });
  }

  @Query(() => [AgentChatChannelRoleDTO])
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_SETTINGS_ACCESS_POLICY))
  async agentChatChannelRoles(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatChannelRoleDTO[]> {
    return this.channelService.findAssignableRoles(workspaceId);
  }

  @Mutation(() => AgentChatChannelDTO)
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_SETTINGS_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_SETTINGS_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_SETTINGS_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_ACCESS_POLICY))
  async moveAgentChatThreadToChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('channelId', { type: () => UUIDScalarType, nullable: true })
    channelId: string | null,
  ): Promise<boolean> {
    await this.threadService.moveToChannel({
      threadId,
      channelId: channelId ?? null,
      authContext: getAgentInboxCallerAuthContextOrThrow(),
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_ACCESS_POLICY))
  async markAgentChatThreadAsDoneInChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
  ): Promise<boolean> {
    await this.triageService.applyToChannelCopy({
      threadId,
      change: { action: AgentChatInboxAction.ARCHIVE },
      authContext: getAgentInboxCallerAuthContextOrThrow(),
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_ACCESS_POLICY))
  async snoozeAgentChatThreadInChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('snoozedUntil', { type: () => Date }) snoozedUntil: Date,
  ): Promise<boolean> {
    await this.triageService.applyToChannelCopy({
      threadId,
      change: { action: AgentChatInboxAction.SNOOZE, snoozedUntil },
      authContext: getAgentInboxCallerAuthContextOrThrow(),
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(AccessPolicyGuard(AGENT_CHAT_CHANNEL_ACCESS_POLICY))
  async reopenAgentChatThreadInChannel(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
  ): Promise<boolean> {
    await this.triageService.applyToChannelCopy({
      threadId,
      change: { action: AgentChatInboxAction.MOVE_TO_INBOX },
      authContext: getAgentInboxCallerAuthContextOrThrow(),
    });

    return true;
  }
}
