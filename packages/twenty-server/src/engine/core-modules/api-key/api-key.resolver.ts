import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/create-api-key.dto';
import { DeleteApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/delete-api-key.dto';
import { GetApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/get-api-key.dto';
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
    return this.apiKeyService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ApiKey, { nullable: true })
  async apiKey(
    @Args('input') input: GetApiKeyDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ApiKey | null> {
    return this.apiKeyService.findById(input.id, workspace.id);
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

  @Mutation(() => Boolean)
  async deleteApiKey(
    @Args('input') input: DeleteApiKeyDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.apiKeyService.delete(input.id, workspace.id);

    return result !== null;
  }
}
