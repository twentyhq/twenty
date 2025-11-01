import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab.input';
import { PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@Resolver(() => PageLayoutTabDTO)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class PageLayoutTabResolver {
  constructor(private readonly pageLayoutTabService: PageLayoutTabService) {}

  @Query(() => [PageLayoutTabDTO])
  async getPageLayoutTabs(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('pageLayoutId', { type: () => String }) pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    return this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );
  }

  @Query(() => PageLayoutTabDTO)
  async getPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.findByIdOrThrow(id, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.LAYOUTS))
  async createPageLayoutTab(
    @Args('input') input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.create(input, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.LAYOUTS))
  async updatePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.LAYOUTS))
  async deletePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedPageLayoutTab = await this.pageLayoutTabService.delete(
      id,
      workspace.id,
    );

    return isDefined(deletedPageLayoutTab);
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.LAYOUTS))
  async destroyPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutTabService.destroy(id, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.LAYOUTS))
  async restorePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.restore(id, workspace.id);
  }
}
