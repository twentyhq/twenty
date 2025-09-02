import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { CreatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab.input';
import { PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver(() => PageLayoutTabDTO)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class PageLayoutTabResolver {
  constructor(private readonly pageLayoutTabService: PageLayoutTabService) {}

  @Query(() => [PageLayoutTabDTO])
  async getPageLayoutTabs(
    @AuthWorkspace() workspace: Workspace,
    @Args('pageLayoutId', { type: () => String }) pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    return this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );
  }

  @Query(() => PageLayoutTabDTO, { nullable: true })
  async getPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.findByIdOrThrow(id, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  async createPageLayoutTab(
    @Args('input') input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.create(input, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  async updatePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deletePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedPageLayoutTab = await this.pageLayoutTabService.delete(
      id,
      workspace.id,
    );

    return isDefined(deletedPageLayoutTab);
  }

  @Mutation(() => Boolean)
  async destroyPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    return this.pageLayoutTabService.destroy(id, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  async restorePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.restore(id, workspace.id);
  }
}
