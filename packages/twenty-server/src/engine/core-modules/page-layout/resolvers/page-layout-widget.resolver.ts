import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';
import { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver(() => PageLayoutWidgetDTO)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class PageLayoutWidgetResolver {
  constructor(
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {}

  @Query(() => [PageLayoutWidgetDTO])
  async getPageLayoutWidgets(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('pageLayoutTabId', { type: () => String }) pageLayoutTabId: string,
  ): Promise<PageLayoutWidgetDTO[]> {
    return this.pageLayoutWidgetService.findByPageLayoutTabIdWithPermissions(
      workspace.id,
      pageLayoutTabId,
      userWorkspaceId,
    );
  }

  @Query(() => PageLayoutWidgetDTO)
  async getPageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.findByIdOrThrowWithPermissions(
      id,
      workspace.id,
      userWorkspaceId,
    );
  }

  @Mutation(() => PageLayoutWidgetDTO)
  async createPageLayoutWidget(
    @Args('input') input: CreatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.createWithPermissions(
      input,
      workspace.id,
      userWorkspaceId,
    );
  }

  @Mutation(() => PageLayoutWidgetDTO)
  async updatePageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.updateWithPermissions(
      id,
      workspace.id,
      input,
      userWorkspaceId,
    );
  }

  @Mutation(() => PageLayoutWidgetDTO)
  async deletePageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.deleteWithPermissions(
      id,
      workspace.id,
      userWorkspaceId,
    );
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
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.restoreWithPermissions(
      id,
      workspace.id,
      userWorkspaceId,
    );
  }
}
