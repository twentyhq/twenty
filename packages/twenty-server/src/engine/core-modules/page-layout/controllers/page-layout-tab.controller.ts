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

import { ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab.input';
import { type PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import { type PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import {
  generatePageLayoutTabExceptionMessage,
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import { PageLayoutTabRestApiExceptionFilter } from 'src/engine/core-modules/page-layout/filters/page-layout-tab-rest-api-exception.filter';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { transformTabsEntitiesToDTOs } from 'src/engine/core-modules/page-layout/utils/transform-tabs-entities-to-dtos.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Controller('rest/metadata/page-layout-tabs')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutTabRestApiExceptionFilter)
export class PageLayoutTabController {
  constructor(
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
    @Query('pageLayoutId') pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    if (!isDefined(pageLayoutId)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    const tabs = await this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );

    return this.processTabsWithPermissions(
      tabs,
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
  ): Promise<PageLayoutTabDTO | null> {
    const tab = await this.pageLayoutTabService.findByIdOrThrow(
      id,
      workspace.id,
    );

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.create(input, workspace.id);

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.update(id, workspace.id, input);

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.delete(id, workspace.id);

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
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

  private async processTabsWithPermissions(
    tabs: PageLayoutTabEntity[],
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
  ): Promise<PageLayoutTabDTO[]> {
    const permissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    return transformTabsEntitiesToDTOs(tabs, permissions);
  }
}
