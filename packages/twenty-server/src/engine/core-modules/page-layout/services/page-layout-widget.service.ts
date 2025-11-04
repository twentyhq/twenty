import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';
import { WidgetConfigurationInterface } from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { validateAndTransformWidgetConfiguration } from 'src/engine/core-modules/page-layout/utils/validate-and-transform-widget-configuration.util';
import { validateWidgetGridPosition } from 'src/engine/core-modules/page-layout/utils/validate-widget-grid-position.util';

@Injectable()
export class PageLayoutWidgetService {
  constructor(
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private getPageLayoutWidgetRepository(
    transactionManager?: EntityManager,
  ): Repository<PageLayoutWidgetEntity> {
    return transactionManager
      ? transactionManager.getRepository(PageLayoutWidgetEntity)
      : this.pageLayoutWidgetRepository;
  }

  async findByPageLayoutTabId(
    workspaceId: string,
    pageLayoutTabId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity[]> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    return repository.find({
      where: {
        pageLayoutTabId,
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const pageLayoutWidget = await repository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    return pageLayoutWidget;
  }

  async create(
    pageLayoutWidgetData: CreatePageLayoutWidgetInput,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    if (!isDefined(pageLayoutWidgetData.title)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.TITLE_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(pageLayoutWidgetData.pageLayoutTabId)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_ID_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(pageLayoutWidgetData.gridPosition)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.GRID_POSITION_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    validateWidgetGridPosition(
      pageLayoutWidgetData.gridPosition,
      pageLayoutWidgetData.title,
    );

    try {
      await this.pageLayoutTabService.findByIdOrThrow(
        pageLayoutWidgetData.pageLayoutTabId,
        workspaceId,
        transactionManager,
      );

      let validatedConfig: WidgetConfigurationInterface | null = null;

      if (pageLayoutWidgetData.configuration && pageLayoutWidgetData.type) {
        const isDashboardV2Enabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
            workspaceId,
          );

        try {
          validatedConfig = validateAndTransformWidgetConfiguration({
            type: pageLayoutWidgetData.type,
            configuration: pageLayoutWidgetData.configuration,
            isDashboardV2Enabled,
          });
        } catch (error) {
          throw new PageLayoutWidgetException(
            generatePageLayoutWidgetExceptionMessage(
              PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
              pageLayoutWidgetData.title,
              pageLayoutWidgetData.type,
              error instanceof Error ? error.message : String(error),
            ),
            PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          );
        }

        if (!validatedConfig) {
          throw new PageLayoutWidgetException(
            generatePageLayoutWidgetExceptionMessage(
              PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
              pageLayoutWidgetData.title,
              pageLayoutWidgetData.type,
            ),
            PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          );
        }
      }

      const repository = this.getPageLayoutWidgetRepository(transactionManager);

      const insertResult = await repository.insert({
        ...pageLayoutWidgetData,
        workspaceId,
        ...(validatedConfig && { configuration: validatedConfig }),
      } as QueryDeepPartialEntity<PageLayoutWidgetEntity>);

      return this.findByIdOrThrow(
        insertResult.identifiers[0].id,
        workspaceId,
        transactionManager,
      );
    } catch (error) {
      if (
        error instanceof PageLayoutTabException &&
        error.code === PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND
      ) {
        throw new PageLayoutWidgetException(
          generatePageLayoutWidgetExceptionMessage(
            PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          ),
          PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: UpdatePageLayoutWidgetInput,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const existingWidget = await repository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(existingWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    if (updateData.gridPosition) {
      const titleForValidation = updateData.title ?? existingWidget.title;

      validateWidgetGridPosition(updateData.gridPosition, titleForValidation);
    }

    let validatedConfig: WidgetConfigurationInterface | null = null;

    if (updateData.configuration) {
      const typeForValidation = updateData.type ?? existingWidget.type;
      const titleForError = updateData.title ?? existingWidget.title;

      if (typeForValidation) {
        const isDashboardV2Enabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
            workspaceId,
          );

        try {
          validatedConfig = validateAndTransformWidgetConfiguration({
            type: typeForValidation,
            configuration: updateData.configuration,
            isDashboardV2Enabled,
          });
        } catch (error) {
          throw new PageLayoutWidgetException(
            generatePageLayoutWidgetExceptionMessage(
              PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
              titleForError,
              typeForValidation,
              error instanceof Error ? error.message : String(error),
            ),
            PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          );
        }

        if (!validatedConfig) {
          throw new PageLayoutWidgetException(
            generatePageLayoutWidgetExceptionMessage(
              PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
              titleForError,
              typeForValidation,
            ),
            PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          );
        }
      }
    }

    await repository.update({ id }, {
      ...updateData,
      ...(validatedConfig && { configuration: validatedConfig }),
    } as QueryDeepPartialEntity<PageLayoutWidgetEntity>);

    return this.findByIdOrThrow(id, workspaceId, transactionManager);
  }

  async delete(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const pageLayoutWidget = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    await repository.softDelete(id);

    return pageLayoutWidget;
  }

  async destroy(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const pageLayoutWidget = await repository.findOne({
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    await repository.delete(id);

    return true;
  }

  async restore(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const pageLayoutWidget = await repository.findOne({
      select: {
        id: true,
        deletedAt: true,
        pageLayoutTabId: true,
      },
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    if (!isDefined(pageLayoutWidget.deletedAt)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_DELETED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    try {
      await this.pageLayoutTabService.findByIdOrThrow(
        pageLayoutWidget.pageLayoutTabId,
        workspaceId,
        transactionManager,
      );
    } catch (error) {
      if (
        error instanceof PageLayoutTabException &&
        error.code === PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND
      ) {
        throw new PageLayoutWidgetException(
          generatePageLayoutWidgetExceptionMessage(
            PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          ),
          PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        );
      }
      throw error;
    }

    await repository.restore(id);

    const restoredPageLayoutWidget = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    return restoredPageLayoutWidget;
  }
}
