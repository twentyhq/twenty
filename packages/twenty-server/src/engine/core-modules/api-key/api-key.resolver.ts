import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import { CreateApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/create-api-key.dto';
import { GetApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/get-api-key.dto';
import { RevokeApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/revoke-api-key.dto';
import { UpdateApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/update-api-key.dto';
import { apiKeyGraphqlApiExceptionHandler } from 'src/engine/core-modules/api-key/utils/api-key-graphql-api-exception-handler.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

import { ApiKeyRoleService } from './api-key-role.service';
import { ApiKey } from './api-key.entity';
import { ApiKeyService } from './api-key.service';

@Resolver(() => ApiKey)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionsGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
export class ApiKeyResolver {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Query(() => [ApiKey])
  async apiKeys(@AuthWorkspace() workspace: Workspace): Promise<ApiKey[]> {
    return this.apiKeyService.findActiveByWorkspaceId(workspace.id);
  }

  @Query(() => ApiKey, { nullable: true })
  async apiKey(
    @Args('input') input: GetApiKeyDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ApiKey | null> {
    try {
      const apiKey = await this.apiKeyService.findById(input.id, workspace.id);

      if (!apiKey) {
        return null;
      }

      return apiKey;
    } catch (error) {
      apiKeyGraphqlApiExceptionHandler(error);
      throw error;
    }
  }

  @Mutation(() => ApiKey)
  async createApiKey(
    @AuthWorkspace() workspace: Workspace,
    @Args('input') input: CreateApiKeyDTO,
  ): Promise<ApiKey> {
    return this.apiKeyService.create({
      name: input.name,
      expiresAt: new Date(input.expiresAt),
      revokedAt: input.revokedAt ? new Date(input.revokedAt) : undefined,
      workspaceId: workspace.id,
      roleId: input.roleId,
    });
  }

  @Mutation(() => ApiKey, { nullable: true })
  async updateApiKey(
    @AuthWorkspace() workspace: Workspace,
    @Args('input') input: UpdateApiKeyDTO,
  ): Promise<ApiKey | null> {
    const updateData: Partial<ApiKey> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.expiresAt !== undefined)
      updateData.expiresAt = new Date(input.expiresAt);
    if (input.revokedAt !== undefined) {
      updateData.revokedAt = input.revokedAt ? new Date(input.revokedAt) : null;
    }

    return this.apiKeyService.update(input.id, workspace.id, updateData);
  }

  @Mutation(() => ApiKey, { nullable: true })
  async revokeApiKey(
    @AuthWorkspace() workspace: Workspace,
    @Args('input') input: RevokeApiKeyDTO,
  ): Promise<ApiKey | null> {
    return this.apiKeyService.revoke(input.id, workspace.id);
  }

  @Mutation(() => Boolean)
  async assignRoleToApiKey(
    @AuthWorkspace() workspace: Workspace,
    @Args('apiKeyId', { type: () => UUIDScalarType }) apiKeyId: string,
    @Args('roleId', { type: () => UUIDScalarType }) roleId: string,
  ): Promise<boolean> {
    try {
      await this.apiKeyRoleService.assignRoleToApiKey({
        apiKeyId,
        roleId,
        workspaceId: workspace.id,
      });

      return true;
    } catch (error) {
      apiKeyGraphqlApiExceptionHandler(error);
      throw error;
    }
  }

  @ResolveField(() => RoleDTO, { nullable: true })
  async role(
    @Parent() apiKey: ApiKey,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<RoleDTO | null> {
    const isApiKeyRolesEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
      workspace.id,
    );

    if (!isApiKeyRolesEnabled) {
      return null;
    }

    const rolesMap = await this.apiKeyRoleService.getRolesByApiKeys({
      apiKeyIds: [apiKey.id],
      workspaceId: workspace.id,
    });

    const role = rolesMap.get(apiKey.id);

    if (!role) {
      throw new ApiKeyException(
        `API key ${apiKey.id} has no role assigned`,
        ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
      );
    }

    return role;
  }
}
