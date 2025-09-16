import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
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
import { ViewV2Service } from 'src/engine/core-modules/view/services/view-v2.service';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/core-modules/view/utils/view-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';

@Resolver(() => ViewDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewResolver {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewSortService: ViewSortService,
    private readonly viewGroupService: ViewGroupService,
    private readonly i18nService: I18nService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly viewV2Service: ViewV2Service,
  ) {}

  @ResolveField(() => String)
  async name(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
    if (view.name.includes('{objectLabelPlural}')) {
      const objectMetadata = await context.loaders.objectMetadataLoader.load({
        objectMetadataId: view.objectMetadataId,
        workspaceId: workspace.id,
      });

      if (objectMetadata) {
        const i18n = this.i18nService.getI18nInstance(context.req.locale);
        const translatedObjectLabel = resolveObjectMetadataStandardOverride(
          {
            labelPlural: objectMetadata.labelPlural,
            labelSingular: objectMetadata.labelSingular,
            description: objectMetadata.description ?? undefined,
            icon: objectMetadata.icon ?? undefined,
            isCustom: objectMetadata.isCustom,
            standardOverrides: objectMetadata.standardOverrides ?? undefined,
          },
          'labelPlural',
          context.req.locale,
          i18n,
        );

        return this.viewService.processViewNameWithTemplate(
          view.name,
          view.isCustom,
          translatedObjectLabel,
          context.req.locale,
        );
      }
    }

    return this.viewService.processViewNameWithTemplate(
      view.name,
      view.isCustom,
      undefined,
      context.req.locale,
    );
  }

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
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewV2Service.createOne({
        createViewInput: input,
        workspaceId: workspace.id,
      });
    }

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
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewV2Service.updateOne({
        updateViewInput: input,
        workspaceId: workspace.id,
      });
    }

    return this.viewService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const deletedView = await this.viewV2Service.deleteOne({
        deleteViewInput: { id },
        workspaceId: workspace.id,
      });

      return isDefined(deletedView);
    }

    const deletedView = await this.viewService.delete(id, workspace.id);

    return isDefined(deletedView);
  }

  @Mutation(() => Boolean)
  async destroyCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const deletedView = await this.viewV2Service.destroyOne({
        destroyViewInput: { id },
        workspaceId: workspace.id,
      });

      return isDefined(deletedView);
    }

    const deletedView = await this.viewService.destroy(id, workspace.id);

    return isDefined(deletedView);
  }

  @ResolveField(() => [ViewFieldDTO])
  async viewFields(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    if (isArray(view.viewFields)) {
      return view.viewFields;
    }

    return this.viewFieldService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewFilterDTO])
  async viewFilters(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    if (isArray(view.viewFilters)) {
      return view.viewFilters;
    }

    return this.viewFilterService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewFilterGroupDTO])
  async viewFilterGroups(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    if (isArray(view.viewFilterGroups)) {
      return view.viewFilterGroups;
    }

    return this.viewFilterGroupService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewSortDTO])
  async viewSorts(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    if (isArray(view.viewSorts)) {
      return view.viewSorts;
    }

    return this.viewSortService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewGroupDTO])
  async viewGroups(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: Workspace,
  ) {
    if (isArray(view.viewGroups)) {
      return view.viewGroups;
    }

    return this.viewGroupService.findByViewId(workspace.id, view.id);
  }
}
