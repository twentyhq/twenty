import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { CreateViewInput } from 'src/engine/core-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/core-modules/view/dtos/inputs/update-view.input';
import { type ViewDTO } from 'src/engine/core-modules/view/dtos/view.dto';
import {
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view.exception';
import { ViewRestApiExceptionFilter } from 'src/engine/core-modules/view/filters/view-rest-api-exception.filter';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';

@Controller('rest/metadata/views')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewRestApiExceptionFilter)
export class ViewController {
  constructor(
    private readonly viewService: ViewService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  async findMany(
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: Workspace,
    @Query('objectMetadataId') objectMetadataId?: string,
  ): Promise<ViewDTO[]> {
    const views = objectMetadataId
      ? await this.viewService.findByObjectMetadataId(
          workspace.id,
          objectMetadataId,
        )
      : await this.viewService.findByWorkspaceId(workspace.id);

    return this.processViewsWithTemplates(views, workspace.id, locale);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const view = await this.viewService.findById(id, workspace.id);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.VIEW_NOT_FOUND,
          ),
        },
      );
    }

    const processedViews = await this.processViewsWithTemplates(
      [view],
      workspace.id,
      locale,
    );

    return processedViews[0];
  }

  @Post()
  async create(
    @Body() input: CreateViewInput,
    @AuthWorkspace() workspace: Workspace,
    @RequestLocale() locale?: keyof typeof APP_LOCALES,
  ): Promise<ViewDTO> {
    const view = await this.viewService.create({
      ...input,
      workspaceId: workspace.id,
    });

    const processedViews = await this.processViewsWithTemplates(
      [view],
      workspace.id,
      locale,
    );

    return processedViews[0];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewInput,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const updatedView = await this.viewService.update(id, workspace.id, input);

    const processedViews = await this.processViewsWithTemplates(
      [updatedView],
      workspace.id,
      locale,
    );

    return processedViews[0];
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedView = await this.viewService.delete(id, workspace.id);

    return { success: isDefined(deletedView) };
  }

  private async processViewsWithTemplates(
    views: ViewDTO[],
    workspaceId: string,
    locale?: keyof typeof APP_LOCALES,
  ): Promise<ViewDTO[]> {
    const hasTemplates = views.some((view) =>
      view.name.includes('{objectLabelPlural}'),
    );

    if (!hasTemplates && views.every((view) => view.isCustom)) {
      return views;
    }

    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        { workspaceId },
      );

    return views.map((view) => {
      let processedName = view.name;

      if (view.name.includes('{objectLabelPlural}')) {
        const objectMetadata = objectMetadataMaps.byId[view.objectMetadataId];

        if (objectMetadata) {
          const i18n = this.i18nService.getI18nInstance(locale ?? 'en');
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
            locale,
            i18n,
          );

          processedName = this.viewService.processViewNameWithTemplate(
            view.name,
            view.isCustom,
            translatedObjectLabel,
            locale,
          );
        }
      } else {
        processedName = this.viewService.processViewNameWithTemplate(
          view.name,
          view.isCustom,
          undefined,
          locale,
        );
      }

      return {
        ...view,
        name: processedName,
      };
    });
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
