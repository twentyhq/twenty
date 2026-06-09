import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { CreateApiKeyInput } from 'src/engine/core-modules/api-key/dtos/create-api-key.input';
import { GetApiKeyInput } from 'src/engine/core-modules/api-key/dtos/get-api-key.input';
import { RevokeApiKeyInput } from 'src/engine/core-modules/api-key/dtos/revoke-api-key.input';
import { UpdateApiKeyInput } from 'src/engine/core-modules/api-key/dtos/update-api-key.input';
import { apiKeyGraphqlApiExceptionHandler } from 'src/engine/core-modules/api-key/utils/api-key-graphql-api-exception-handler.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireAccessTokenGuard } from 'src/engine/guards/require-access-token.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

import { ApiKeyRoleService } from './services/api-key-role.service';
import { ApiKeyService } from './services/api-key.service';

@MetadataResolver(() => ApiKeyEntity)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
export class ApiKeyResolver {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  @Query(() => [ApiKeyEntity])
  async apiKeys(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity[]> {
    return this.apiKeyService.findActiveByWorkspaceId(workspace.id);
  }

  @Query(() => ApiKeyEntity, { nullable: true })
  async apiKey(
    @Args('input') input: GetApiKeyInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity | null> {
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

  // Minting an API key requires an ACCESS token — derived PLAYGROUND tokens
  // and API keys must not escalate into a long-lived credential.
  @UseGuards(RequireAccessTokenGuard)
  @Mutation(() => ApiKeyEntity)
  async createApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateApiKeyInput,
  ): Promise<ApiKeyEntity> {
    return this.apiKeyService.create({
      name: input.name,
      expiresAt: new Date(input.expiresAt),
      revokedAt: input.revokedAt ? new Date(input.revokedAt) : undefined,
      workspaceId: workspace.id,
      roleId: input.roleId,
    });
  }

  @UseGuards(RequireAccessTokenGuard)
  @Mutation(() => ApiKeyEntity, { nullable: true })
  async updateApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: UpdateApiKeyInput,
  ): Promise<ApiKeyEntity | null> {
    const updateData: QueryDeepPartialEntity<ApiKeyEntity> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.expiresAt !== undefined)
      updateData.expiresAt = new Date(input.expiresAt);
    if (input.revokedAt !== undefined) {
      updateData.revokedAt = input.revokedAt ? new Date(input.revokedAt) : null;
    }

    return this.apiKeyService.update(input.id, workspace.id, updateData);
  }

  @UseGuards(RequireAccessTokenGuard)
  @Mutation(() => ApiKeyEntity, { nullable: true })
  async revokeApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RevokeApiKeyInput,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyService.revoke(input.id, workspace.id);
  }

  @UseGuards(RequireAccessTokenGuard)
  @Mutation(() => Boolean)
  async assignRoleToApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
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

  @ResolveField(() => RoleDTO)
  async role(
    @Parent() apiKey: ApiKeyEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RoleDTO> {
    return this.apiKeyRoleService.getRoleDtoByApiKeyId({
      apiKeyId: apiKey.id,
      workspaceId: workspace.id,
    });
  }
}
