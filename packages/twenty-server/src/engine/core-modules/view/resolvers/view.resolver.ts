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

import { i18n } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { CreateViewInput } from 'src/engine/core-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/core-modules/view/dtos/inputs/update-view.input';
import { ViewDTO } from 'src/engine/core-modules/view/dtos/view.dto';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/core-modules/view/utils/view-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';

@Resolver(() => ViewDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewResolver {
  constructor(private readonly viewService: ViewService) {}

  @ResolveField(() => String)
  async name(
    @Parent() view: ViewDTO,
    @Context() context: I18nContext,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
    if (view.name.includes('{objectLabelPlural}')) {
      const objectMetadata = await this.viewService.getObjectMetadataByViewId(
        view.id,
        workspace.id,
      );

      if (objectMetadata) {
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
        );

        const messageId = generateMessageId(view.name);
        const translatedTemplate = i18n._(messageId, {
          objectLabelPlural: translatedObjectLabel,
        });

        if (translatedTemplate !== messageId) {
          return translatedTemplate;
        }

        return view.name.replace('{objectLabelPlural}', translatedObjectLabel);
      }
    }

    if (view.isCustom) {
      return view.name;
    }

    const messageId = generateMessageId(view.name);
    const translatedMessage = i18n._(messageId);

    return translatedMessage !== messageId ? translatedMessage : view.name;
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
}
