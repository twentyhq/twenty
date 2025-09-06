import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';
import { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
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
    @Args('pageLayoutTabId', { type: () => String }) pageLayoutTabId: string,
  ): Promise<PageLayoutWidgetDTO[]> {
    return this.pageLayoutWidgetService.findByPageLayoutTabId(
      workspace.id,
      pageLayoutTabId,
    );
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
