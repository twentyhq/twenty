import { Injectable } from '@nestjs/common';

import { type ObjectsPermissions } from 'twenty-shared/types';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { type PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import { type PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import { type PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import { type PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { type PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { type PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { transformLayoutsEntitiesToDTOs } from 'src/engine/core-modules/page-layout/utils/transform-layouts-entities-to-dtos.util';
import { transformTabsEntitiesToDTOs } from 'src/engine/core-modules/page-layout/utils/transform-tabs-entities-to-dtos.util';
import { transformWidgetEntityToDTO } from 'src/engine/core-modules/page-layout/utils/transform-widget-entity-to-dto.util';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Injectable()
export class PageLayoutPermissionService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  async getUserPermissions(
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

  async applyPermissionsToLayouts(
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

  async applyPermissionsToTabs(
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

  async applyPermissionsToWidgets(
    widgets: PageLayoutWidgetEntity[],
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
  ): Promise<PageLayoutWidgetDTO[]> {
    const permissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    return widgets.map((widget) =>
      transformWidgetEntityToDTO(widget, permissions),
    );
  }
}
