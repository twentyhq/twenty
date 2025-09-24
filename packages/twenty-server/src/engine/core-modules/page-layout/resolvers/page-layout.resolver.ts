import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { UpdatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout.input';
import { PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutUpdateService } from 'src/engine/core-modules/page-layout/services/page-layout-update.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver(() => PageLayoutDTO)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class PageLayoutResolver {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutUpdateService: PageLayoutUpdateService,
  ) {}

  @Query(() => [PageLayoutDTO])
  async getPageLayouts(
    @AuthWorkspace() workspace: Workspace,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
  ): Promise<PageLayoutDTO[]> {
    if (objectMetadataId) {
      return this.pageLayoutService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
      );
    }

    return this.pageLayoutService.findByWorkspaceId(workspace.id);
  }

  @Query(() => PageLayoutDTO, { nullable: true })
  async getPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO | null> {
    return this.pageLayoutService.findByIdOrThrow(id, workspace.id);
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

  @Mutation(() => PageLayoutDTO)
  async updatePageLayoutWithTabsAndWidgets(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutWithTabsInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutUpdateService.updatePageLayoutWithTabs({
      id,
      workspaceId: workspace.id,
      input,
    });
  }
}
