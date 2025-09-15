import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout.input';
import { PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Resolver(() => PageLayoutDTO)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class PageLayoutResolver {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  @Query(() => [PageLayoutDTO])
  async getPageLayouts(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
  ): Promise<PageLayoutDTO[]> {
    const layouts = objectMetadataId
      ? await this.pageLayoutService.findByObjectMetadataId(
          workspace.id,
          objectMetadataId,
        )
      : await this.pageLayoutService.findByWorkspaceId(workspace.id);

    return this.filterLayoutsWithPermissions(
      layouts,
      userWorkspaceId,
      workspace.id,
    );
  }

  @Query(() => PageLayoutDTO, { nullable: true })
  async getPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<PageLayoutDTO | null> {
    const layout = await this.pageLayoutService.findByIdOrThrow(
      id,
      workspace.id,
    );

    if (!layout) {
      return null;
    }

    const [filteredLayout] = await this.filterLayoutsWithPermissions(
      [layout],
      userWorkspaceId,
      workspace.id,
    );

    return filteredLayout;
  }

  private async filterLayoutsWithPermissions(
    layouts: PageLayoutDTO[],
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<PageLayoutDTO[]> {
    const [userRole] = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      })
      .then((roles) => roles?.get(userWorkspaceId) ?? []);

    if (!userRole) {
      return layouts.map((layout) => ({
        ...layout,
        tabs: layout.tabs?.map((tab) => ({
          ...tab,
          widgets: tab.widgets?.map((widget) => ({
            ...widget,
            configuration: null,
            hasAccess: false,
          })),
        })),
      }));
    }

    const { data: rolesPermissions } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId,
      });

    const userObjectPermissions = rolesPermissions[userRole.id] ?? {};

    return layouts.map((layout) => ({
      ...layout,
      tabs: layout.tabs?.map((tab) => ({
        ...tab,
        widgets: tab.widgets?.map((widget) => {
          let hasAccess = true;

          if (widget.objectMetadataId) {
            const objectPermission =
              userObjectPermissions[widget.objectMetadataId];

            hasAccess = objectPermission?.canRead === true;
          }

          return {
            ...widget,
            configuration: hasAccess ? widget.configuration : null,
            hasAccess,
          };
        }),
      })),
    }));
  }

  @Mutation(() => PageLayoutDTO)
  async createPageLayout(
    @Args('input') input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.create(input, workspace.id);
  }

  @Mutation(() => PageLayoutDTO)
  async updatePageLayout(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.update(id, workspace.id, input);
  }

  @Mutation(() => PageLayoutDTO)
  async deletePageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO> {
    const deletedPageLayout = await this.pageLayoutService.delete(
      id,
      workspace.id,
    );

    return deletedPageLayout;
  }

  @Mutation(() => Boolean)
  async destroyPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedPageLayout = await this.pageLayoutService.destroy(
      id,
      workspace.id,
    );

    return isDefined(deletedPageLayout);
  }

  @Mutation(() => PageLayoutDTO)
  async restorePageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.restore(id, workspace.id);
  }
}
