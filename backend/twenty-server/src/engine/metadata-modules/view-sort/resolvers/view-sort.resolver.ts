import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { isDefined } from 'class-validator';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-sort-permission.guard';
import { DeleteViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-sort-permission.guard';
import { DestroyViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-sort-permission.guard';
import { UpdateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-sort-permission.guard';
import { CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';
import { DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';
import { DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';

@MetadataResolver(() => ViewSortDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewSortResolver {
  constructor(private readonly viewSortService: ViewSortService) {}

  @Query(() => [ViewSortDTO])
  @UseGuards(NoPermissionGuard)
  async getViewSorts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewSortDTO[]> {
    if (viewId) {
      return this.viewSortService.findByViewId(workspace.id, viewId);
    }

    return this.viewSortService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewSortDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO | null> {
    return this.viewSortService.findById(id, workspaceId);
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(CreateViewSortPermissionGuard)
  async createViewSort(
    @Args('input') createViewSortInput: CreateViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return this.viewSortService.createOne({
      createViewSortInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(UpdateViewSortPermissionGuard)
  async updateViewSort(
    @Args('input') updateViewSortInput: UpdateViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return this.viewSortService.updateOne({
      updateViewSortInput,
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(DeleteViewSortPermissionGuard)
  async deleteViewSort(
    @Args('input') deleteViewSortInput: DeleteViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedViewSort = await this.viewSortService.deleteOne({
      deleteViewSortInput,
      workspaceId,
    });

    return isDefined(deletedViewSort);
  }

  @Mutation(() => Boolean)
  @UseGuards(DestroyViewSortPermissionGuard)
  async destroyViewSort(
    @Args('input') destroyViewSortInput: DestroyViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    const destroyedViewSort = await this.viewSortService.destroyOne({
      destroyViewSortInput,
      workspaceId,
    });

    return isDefined(destroyedViewSort);
  }
}
