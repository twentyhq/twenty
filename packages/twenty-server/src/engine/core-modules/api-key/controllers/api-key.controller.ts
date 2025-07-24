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

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { CreateApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/create-api-key.dto';
import { UpdateApiKeyDTO } from 'src/engine/core-modules/api-key/dtos/update-api-key.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

/**
 * rest/apiKeys is deprecated, use rest/metadata/apiKeys instead
 * rest/apiKeys will be removed in the future
 */
@Controller(['rest/apiKeys', 'rest/metadata/apiKeys'])
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  async findAll(@AuthWorkspace() workspace: Workspace): Promise<ApiKey[]> {
    return this.apiKeyService.findActiveByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ApiKey | null> {
    return this.apiKeyService.findById(id, workspace.id);
  }

  @Post()
  async create(
    @Body() createApiKeyDto: CreateApiKeyDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ApiKey> {
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ApiKey | null> {
    const updateData: Partial<ApiKey> = {};

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

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ApiKey | null> {
    return this.apiKeyService.revoke(id, workspace.id);
  }
}
