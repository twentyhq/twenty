import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
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
import { CreateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/create-agent-chat-channel.input';
import { UpdateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/update-agent-chat-channel.input';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { buildAgentChatCallerOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-caller-or-throw.util';
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
    application: { withUser: true, withoutUser: true },
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  AiGraphqlApiExceptionInterceptor,
)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver(() => AgentChatChannelDTO)
export class AgentChatChannelManagementResolver {
  constructor(
    private readonly channelService: AgentChatChannelService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Query(() => [AgentChatChannelDTO])
  async agentChatChannels(
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
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
      caller: buildAgentChatCallerOrThrow({
        workspaceMemberId,
        callingApplication,
      }),
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
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<AgentChatChannelDTO> {
    return this.channelService.createChannel({
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      roleIds: input.roleIds,
      universalIdentifier: input.universalIdentifier ?? undefined,
      callingApplication: getScopedCallingApplication(callingApplication),
      workspaceId,
    });
  }

  @Mutation(() => AgentChatChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async updateAgentChatChannel(
    @Args('channelId', { type: () => UUIDScalarType }) channelId: string,
    @Args('input', { type: () => UpdateAgentChatChannelInput })
    input: UpdateAgentChatChannelInput,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
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
      caller: buildAgentChatCallerOrThrow({
        workspaceMemberId,
        callingApplication,
      }),
      callingApplication: getScopedCallingApplication(callingApplication),
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
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<boolean> {
    await this.channelService.deleteChannel({
      channelId,
      destinationChannelId: destinationChannelId ?? null,
      caller: buildAgentChatCallerOrThrow({
        workspaceMemberId,
        callingApplication,
      }),
      callingApplication: getScopedCallingApplication(callingApplication),
      workspaceId,
    });

    return true;
  }
}
