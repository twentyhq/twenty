import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFieldV2Service } from 'src/engine/core-modules/view/services/view-field-v2.service';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/core-modules/view/utils/view-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver(() => ViewFieldDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFieldResolver {
  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly viewFieldV2Service: ViewFieldV2Service,
  ) {}

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
    @Args('input') updateViewFieldInput: UpdateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ViewFieldDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.updateOne({
        updateViewFieldInput,
        workspaceId,
      });
    }

    return this.viewFieldService.update(
      updateViewFieldInput.id,
      workspaceId,
      updateViewFieldInput.update,
    );
  }

  @Mutation(() => ViewFieldDTO)
  async createCoreViewField(
    @Args('input') createViewFieldInput: CreateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ViewFieldDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.createOne({
        createViewFieldInput,
        workspaceId,
      });
    }

    return this.viewFieldService.create({
      ...createViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  async deleteCoreViewField(
    @Args('input') deleteViewFieldInput: DeleteViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ViewFieldDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.deleteOne({
        deleteViewFieldInput,
        workspaceId,
      });
    }
    const deletedViewField = await this.viewFieldService.delete(
      deleteViewFieldInput.id,
      workspaceId,
    );

    return deletedViewField;
  }

  @Mutation(() => ViewFieldDTO)
  async destroyCoreViewField(
    @Args('input') destroyViewFieldInput: DestroyViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ViewFieldDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.destroyOne({
        destroyViewFieldInput,
        workspaceId,
      });
    }

    const deletedViewField = await this.viewFieldService.destroy(
      destroyViewFieldInput.id,
      workspaceId,
    );

    return deletedViewField;
  }
}
