import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PermissionFlagType } from 'twenty-shared/constants';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreateApiKeyInput } from 'src/engine/core-modules/api-key/dtos/create-api-key.input';
import { UpdateApiKeyInput } from 'src/engine/core-modules/api-key/dtos/update-api-key.input';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { RequireAccessTokenGuard } from 'src/engine/guards/require-access-token.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

/**
 * rest/apiKeys is deprecated, use rest/metadata/apiKeys instead
 * rest/apiKeys will be removed in the future
 */
@Controller(['rest/apiKeys', 'rest/metadata/apiKeys'])
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
@UseFilters(PermissionsRestApiExceptionFilter, RestApiExceptionFilter)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  async findAll(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity[]> {
    return this.apiKeyService.findActiveByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyService.findById(id, workspace.id);
  }

  // Minting an API key requires an ACCESS token — derived PLAYGROUND tokens
  // and API keys must not escalate into a long-lived credential.
  @UseGuards(RequireAccessTokenGuard)
  @Post()
  async create(
    @Body() createApiKeyDto: CreateApiKeyInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity> {
    return this.apiKeyService.create({
      name: createApiKeyDto.name,
      expiresAt: new Date(createApiKeyDto.expiresAt),
      revokedAt: createApiKeyDto.revokedAt
        ? new Date(createApiKeyDto.revokedAt)
        : undefined,
      workspaceId: workspace.id,
      roleId: createApiKeyDto.roleId,
    });
  }

  @UseGuards(RequireAccessTokenGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity | null> {
    const updateData: QueryDeepPartialEntity<ApiKeyEntity> = {};

    if (updateApiKeyDto.name !== undefined)
      updateData.name = updateApiKeyDto.name;
    if (updateApiKeyDto.expiresAt !== undefined)
      updateData.expiresAt = new Date(updateApiKeyDto.expiresAt);
    if (updateApiKeyDto.revokedAt !== undefined) {
      updateData.revokedAt = updateApiKeyDto.revokedAt
        ? new Date(updateApiKeyDto.revokedAt)
        : undefined;
    }

    return this.apiKeyService.update(id, workspace.id, updateData);
  }

  @UseGuards(RequireAccessTokenGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyService.revoke(id, workspace.id);
  }
}
