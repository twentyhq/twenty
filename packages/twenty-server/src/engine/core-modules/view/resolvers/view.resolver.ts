import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { CreateViewInput } from 'src/engine/core-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/core-modules/view/dtos/inputs/update-view.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { ViewFilterGroupDTO } from 'src/engine/core-modules/view/dtos/view-filter-group.dto';
import { ViewFilterDTO } from 'src/engine/core-modules/view/dtos/view-filter.dto';
import { ViewGroupDTO } from 'src/engine/core-modules/view/dtos/view-group.dto';
import { ViewSortDTO } from 'src/engine/core-modules/view/dtos/view-sort.dto';
import { ViewDTO } from 'src/engine/core-modules/view/dtos/view.dto';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { ViewFilterGroupService } from 'src/engine/core-modules/view/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { ViewGroupService } from 'src/engine/core-modules/view/services/view-group.service';
import { ViewSortService } from 'src/engine/core-modules/view/services/view-sort.service';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/core-modules/view/utils/view-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver(() => ViewDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewResolver {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewGroupService: ViewGroupService,
    private readonly viewSortService: ViewSortService,
  ) {}

  @Query(() => [ViewDTO])
  async getCoreViews(
    @AuthWorkspace() workspace: Workspace,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
  ): Promise<ViewDTO[]> {
    if (objectMetadataId) {
      return this.viewService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
      );
    }

    return this.viewService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewDTO, { nullable: true })
  async getCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO | null> {
    return this.viewService.findById(id, workspace.id);
  }

  @Mutation(() => ViewDTO)
  async createCoreView(
    @Args('input') input: CreateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    return this.viewService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewDTO)
  async updateCoreView(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    return this.viewService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedView = await this.viewService.delete(id, workspace.id);

    return isDefined(deletedView);
  }

  @Mutation(() => Boolean)
  async destroyCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedView = await this.viewService.destroy(id, workspace.id);

    return isDefined(deletedView);
  }

  @ResolveField(() => [ViewFieldDTO])
  async viewFields(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.viewFieldService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewFilterDTO])
  async viewFilters(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.viewFilterService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewFilterGroupDTO])
  async viewFilterGroups(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.viewFilterGroupService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewSortDTO])
  async viewSorts(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.viewSortService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewGroupDTO])
  async viewGroups(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.viewGroupService.findByViewId(workspace.id, view.id);
  }
}
