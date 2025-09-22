import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout.input';
import { PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { transformLayoutsEntitiesToDTOs } from 'src/engine/core-modules/page-layout/utils/transform-layouts-entities-to-dtos.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
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
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  @Query(() => [PageLayoutDTO])
  async getPageLayouts(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
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
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Query(() => PageLayoutDTO, { nullable: true })
  async getPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
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
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return filteredLayout;
  }

  private async filterLayoutsWithPermissions(
    layouts: PageLayoutEntity[],
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
  ): Promise<PageLayoutDTO[]> {
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

      const permissions = rolesPermissions[roleId] ?? {};

      return transformLayoutsEntitiesToDTOs(layouts, permissions);
    }

    const [userRole] = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      })
      .then((roles) => roles?.get(userWorkspaceId) ?? []);

    if (!userRole) {
      return transformLayoutsEntitiesToDTOs(layouts, {});
    }

    const { data: rolesPermissions } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId,
      });

    const userObjectPermissions = rolesPermissions[userRole.id] ?? {};

    return transformLayoutsEntitiesToDTOs(layouts, userObjectPermissions);
  }

  @Mutation(() => PageLayoutDTO)
  async createPageLayout(
    @Args('input') input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const layout = await this.pageLayoutService.create(input, workspace.id);

    const [transformed] = await this.filterLayoutsWithPermissions(
      [layout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return transformed;
  }

  @Mutation(() => PageLayoutDTO)
  async updatePageLayout(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const layout = await this.pageLayoutService.update(id, workspace.id, input);

    const [transformed] = await this.filterLayoutsWithPermissions(
      [layout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return transformed;
  }

  @Mutation(() => PageLayoutDTO)
  async deletePageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const deletedPageLayout = await this.pageLayoutService.delete(
      id,
      workspace.id,
    );

    const [transformed] = await this.filterLayoutsWithPermissions(
      [deletedPageLayout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return transformed;
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
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const layout = await this.pageLayoutService.restore(id, workspace.id);

    const [transformed] = await this.filterLayoutsWithPermissions(
      [layout],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return transformed;
  }
}
