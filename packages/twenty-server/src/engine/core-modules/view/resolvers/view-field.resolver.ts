import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { DeleteDestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/core-modules/view/utils/view-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver(() => ViewFieldDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFieldResolver {
  constructor(private readonly viewFieldService: ViewFieldService) {}

  @Query(() => [ViewFieldDTO])
  async getCoreViewFields(
    @Args('viewId', { type: () => String }) viewId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFieldEntity[]> {
    return this.viewFieldService.findByViewId(workspace.id, viewId);
  }

  @Query(() => ViewFieldDTO, { nullable: true })
  async getCoreViewField(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFieldEntity | null> {
    return this.viewFieldService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFieldDTO)
  async updateCoreViewField(
    @Args('input') input: UpdateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFieldEntity> {
    return this.viewFieldService.update(input.id, workspace.id, input);
  }

  @Mutation(() => ViewFieldDTO)
  async createCoreViewField(
    @Args('input') input: CreateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFieldEntity> {
    return this.viewFieldService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => Boolean)
  async deleteCoreViewField(
    @Args('input') input: DeleteDestroyViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewField = await this.viewFieldService.delete(
      input.id,
      workspace.id,
    );

    return isDefined(deletedViewField);
  }

  @Mutation(() => Boolean)
  async destroyCoreViewField(
    @Args('input') input: DeleteDestroyViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewField = await this.viewFieldService.destroy(
      input.id,
      workspace.id,
    );

    return isDefined(deletedViewField);
  }
}
