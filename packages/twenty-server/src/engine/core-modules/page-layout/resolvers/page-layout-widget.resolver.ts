import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';
import { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { checkWidgetsPermissions } from 'src/engine/core-modules/page-layout/utils/check-widget-permission.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Resolver(() => PageLayoutWidgetDTO)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class PageLayoutWidgetResolver {
  constructor(
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  @Query(() => [PageLayoutWidgetDTO])
  async getPageLayoutWidgets(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('pageLayoutTabId', { type: () => String }) pageLayoutTabId: string,
  ): Promise<PageLayoutWidgetDTO[]> {
    const widgets = await this.pageLayoutWidgetService.findByPageLayoutTabId(
      workspace.id,
      pageLayoutTabId,
    );

    const [userRole] = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId: workspace.id,
      })
      .then((roles) => roles?.get(userWorkspaceId) ?? []);

    if (!userRole) {
      return widgets.map((widget) => ({
        ...widget,
        configuration: null,
        canReadWidget: false,
      }));
    }

    const { data: rolesPermissions } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId: workspace.id,
      });

    const userObjectPermissions = rolesPermissions[userRole.id] ?? {};

    return checkWidgetsPermissions(widgets, userObjectPermissions);
  }

  @Query(() => PageLayoutWidgetDTO)
  async getPageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.findByIdOrThrow(id, workspace.id);
  }

  @Mutation(() => PageLayoutWidgetDTO)
  async createPageLayoutWidget(
    @Args('input') input: CreatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.create(input, workspace.id);
  }

  @Mutation(() => PageLayoutWidgetDTO)
  async updatePageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.update(id, workspace.id, input);
  }

  @Mutation(() => PageLayoutWidgetDTO)
  async deletePageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.delete(id, workspace.id);
  }

  @Mutation(() => Boolean)
  async destroyPageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    return this.pageLayoutWidgetService.destroy(id, workspace.id);
  }

  @Mutation(() => PageLayoutWidgetDTO)
  async restorePageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.restore(id, workspace.id);
  }
}
