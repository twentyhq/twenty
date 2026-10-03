import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ApiPath } from 'twenty-shared/types';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { isMetadataRestRequest } from 'src/engine/api/rest/metadata/utils/is-metadata-rest-request.util';
import { paginateMetadataRestItems } from 'src/engine/api/rest/metadata/utils/paginate-metadata-rest-items.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreateApiKeyInput } from 'src/engine/core-modules/api-key/dtos/create-api-key.input';
import { UpdateApiKeyInput } from 'src/engine/core-modules/api-key/dtos/update-api-key.input';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';

// rest/apiKeys is deprecated in favor of rest/metadata/apiKeys and will be removed
@Controller([`${ApiPath.Rest}/apiKeys`, `${ApiPath.Rest}/metadata/apiKeys`])
@UseGuards(
  JwtAuthGuard,
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  RestApiExceptionFilter,
  AuthRestApiExceptionFilter,
)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  async findAll(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const apiKeys = await this.apiKeyService.findActiveByWorkspaceId(
      workspace.id,
    );

    return isMetadataRestRequest(request)
      ? paginateMetadataRestItems({ items: apiKeys, request })
      : apiKeys;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyService.findById(id, workspace.id);
  }

  // Creating a key assigns it a role, so it also requires ROLES to prevent
  // binding a role above the caller's own.
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: true,
    }),
    SettingsPermissionGuard(PermissionFlagType.ROLES),
  )
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

  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: true,
    }),
  )
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
        : null;
    }

    return this.apiKeyService.update(id, workspace.id, updateData);
  }

  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: true,
    }),
  )
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyService.revoke(id, workspace.id);
  }
}
