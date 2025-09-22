import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import { type PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutRestApiExceptionFilter } from 'src/engine/core-modules/page-layout/filters/page-layout-rest-api-exception.filter';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { transformLayoutsEntitiesToDTOs } from 'src/engine/core-modules/page-layout/utils/transform-layouts-entities-to-dtos.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Controller('rest/metadata/page-layouts')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutRestApiExceptionFilter)
export class PageLayoutController {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
    @Query('objectMetadataId') objectMetadataId?: string,
  ): Promise<PageLayoutDTO[]> {
    const layouts = isDefined(objectMetadataId)
      ? await this.pageLayoutService.findByObjectMetadataId(
          workspace.id,
          objectMetadataId,
        )
      : await this.pageLayoutService.findByWorkspaceId(workspace.id);

    return this.processLayoutsWithPermissions(
      layouts,
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO | null> {
    const layout = await this.pageLayoutService.findByIdOrThrow(
      id,
      workspace.id,
    );

    const processedLayouts = await this.processLayoutsWithPermissions(
      [layout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedLayouts[0];
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const layout = await this.pageLayoutService.create(input, workspace.id);

    const processedLayouts = await this.processLayoutsWithPermissions(
      [layout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedLayouts[0];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const updatedPageLayout = await this.pageLayoutService.update(
      id,
      workspace.id,
      input,
    );

    const processedLayouts = await this.processLayoutsWithPermissions(
      [updatedPageLayout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedLayouts[0];
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const deletedPageLayout = await this.pageLayoutService.delete(
      id,
      workspace.id,
    );

    const processedLayouts = await this.processLayoutsWithPermissions(
      [deletedPageLayout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedLayouts[0];
  }

  private async getUserPermissions(
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
  ): Promise<ObjectsPermissions> {
    if (apiKeyId) {
      const roleId = await this.apiKeyRoleService.getRoleIdForApiKey(
        apiKeyId,
        workspaceId,
      );

      const { data: rolesPermissions } =
        await this.workspacePermissionsCacheService.getRolesPermissionsFromCache(
          {
            workspaceId,
          },
        );

      return rolesPermissions[roleId] ?? {};
    }

    if (userWorkspaceId) {
      const [userRole] = await this.userRoleService
        .getRolesByUserWorkspaces({
          userWorkspaceIds: [userWorkspaceId],
          workspaceId,
        })
        .then((roles) => roles?.get(userWorkspaceId) ?? []);

      if (!userRole) {
        return {};
      }

      const { data: rolesPermissions } =
        await this.workspacePermissionsCacheService.getRolesPermissionsFromCache(
          {
            workspaceId,
          },
        );

      return rolesPermissions[userRole.id] ?? {};
    }

    return {};
  }

  private async processLayoutsWithPermissions(
    layouts: PageLayoutEntity[],
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
  ): Promise<PageLayoutDTO[]> {
    const permissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    return transformLayoutsEntitiesToDTOs(layouts, permissions);
  }
}
