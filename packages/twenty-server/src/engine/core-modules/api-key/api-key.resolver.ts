import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/create-api-key.dto';
import { GetApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/get-api-key.dto';
import { RevokeApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/revoke-api-key.dto';
import { UpdateApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/update-api-key.dto';
import { apiKeyGraphqlApiExceptionHandler } from 'src/engine/core-modules/api-key/utils/api-key-graphql-api-exception-handler.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { ApiKey } from './api-key.entity';
import { ApiKeyService } from './api-key.service';

@Resolver(() => ApiKey)
@UseGuards(WorkspaceAuthGuard)
export class ApiKeyResolver {
  constructor(private readonly apiKeyService: ApiKeyService) {}

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
}
