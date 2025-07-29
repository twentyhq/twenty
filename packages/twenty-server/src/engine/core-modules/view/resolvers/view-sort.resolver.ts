import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateViewSortInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/engine/core-modules/view/dtos/view-sort.dto';
import { ViewSortService } from 'src/engine/core-modules/view/services/view-sort.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver(() => ViewSortDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewSortResolver {
  constructor(private readonly viewSortService: ViewSortService) {}

  @Query(() => [ViewSortDTO])
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewSorts(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewSortDTO[]> {
    if (viewId) {
      return this.viewSortService.findByViewId(workspace.id, viewId);
    }

    return this.viewSortService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewSortDTO, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO | null> {
    return this.viewSortService.findById(id, workspace.id);
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(WorkspaceAuthGuard)
  async createCoreViewSort(
    @Args('input') input: CreateViewSortInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    return this.viewSortService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewSortInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    const updatedViewSort = await this.viewSortService.update(
      id,
      workspace.id,
      input,
    );

    if (!updatedViewSort) {
      throw new Error('ViewSort not found');
    }

    return updatedViewSort;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async deleteCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewSort = await this.viewSortService.delete(id, workspace.id);

    return deletedViewSort !== null;
  }
}
