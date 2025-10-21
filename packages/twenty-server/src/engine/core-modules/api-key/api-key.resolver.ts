import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

import { ApiKeyRoleService } from './api-key-role.service';
import { ApiKeyEntity } from './api-key.entity';
import { ApiKeyService } from './api-key.service';

@Resolver(() => ApiKeyEntity)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionsGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
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
    @Args('input') input: GetApiKeyDTO,
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

  @Mutation(() => ApiKeyEntity)
  async createApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateApiKeyDTO,
  ): Promise<ApiKeyEntity> {
    return this.apiKeyService.create({
      name: input.name,
      expiresAt: new Date(input.expiresAt),
      revokedAt: input.revokedAt ? new Date(input.revokedAt) : undefined,
      workspaceId: workspace.id,
      roleId: input.roleId,
    });
  }

  @Mutation(() => ApiKeyEntity, { nullable: true })
  async updateApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: UpdateApiKeyDTO,
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

  @Mutation(() => ApiKeyEntity, { nullable: true })
  async revokeApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RevokeApiKeyDTO,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyService.revoke(input.id, workspace.id);
  }

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
