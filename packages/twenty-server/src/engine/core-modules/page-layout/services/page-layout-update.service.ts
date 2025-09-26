import { Injectable } from '@nestjs/common';

import { computeDiffBetweenObjects, isDefined } from 'twenty-shared/utils';
import { DataSource, EntityManager } from 'typeorm';

import { CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget-with-id.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { WidgetConfigurationInterface } from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { validateAndTransformWidgetConfiguration } from 'src/engine/core-modules/page-layout/utils/validate-and-transform-widget-configuration.util';

type UpdatePageLayoutWithTabsParams = {
  id: string;
  workspaceId: string;
  input: UpdatePageLayoutWithTabsInput;
  transactionManager?: EntityManager;
};

type UpdatePageLayoutTabsParams = {
  pageLayoutId: string;
  workspaceId: string;
  tabs: UpdatePageLayoutTabWithWidgetsInput[];
  transactionManager: EntityManager;
};

type UpdateWidgetsForTabParams = {
  tabId: string;
  widgets: UpdatePageLayoutWidgetWithIdInput[];
  workspaceId: string;
  transactionManager: EntityManager;
};

@Injectable()
export class PageLayoutUpdateService {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
    private readonly dataSource: DataSource,
  ) {}

  async updatePageLayoutWithTabs({
    id,
    workspaceId,
    input,
    transactionManager,
  }: UpdatePageLayoutWithTabsParams): Promise<PageLayoutEntity> {
    if (!isDefined(transactionManager)) {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await this.updatePageLayoutWithTabsWithinTransaction({
          id,
          workspaceId,
          input,
          transactionManager: queryRunner.manager,
        });

        await queryRunner.commitTransaction();

        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    return this.updatePageLayoutWithTabsWithinTransaction({
      id,
      workspaceId,
      input,
      transactionManager,
    });
  }

  private async updatePageLayoutWithTabsWithinTransaction({
    id,
    workspaceId,
    input,
    transactionManager,
  }: UpdatePageLayoutWithTabsParams & {
    transactionManager: EntityManager;
  }): Promise<PageLayoutEntity> {
    await this.pageLayoutService.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    const { tabs, ...updateData } = input;

    await this.pageLayoutService.update(
      id,
      workspaceId,
      updateData,
      transactionManager,
    );

    await this.updatePageLayoutTabs({
      pageLayoutId: id,
      workspaceId,
      tabs,
      transactionManager,
    });

    return this.pageLayoutService.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );
  }

  private async updatePageLayoutTabs({
    pageLayoutId,
    workspaceId,
    tabs,
    transactionManager,
  }: UpdatePageLayoutTabsParams): Promise<void> {
    const existingTabs = await this.pageLayoutTabService.findByPageLayoutId(
      workspaceId,
      pageLayoutId,
      transactionManager,
    );

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      idsToDelete,
    } = computeDiffBetweenObjects<
      PageLayoutTabEntity,
      UpdatePageLayoutTabWithWidgetsInput
    >({
      existingObjects: existingTabs,
      receivedObjects: tabs,
      propertiesToCompare: ['title', 'position'],
    });

    for (const tabId of idsToDelete) {
      await this.pageLayoutTabService.delete(
        tabId,
        workspaceId,
        transactionManager,
      );
    }

    for (const tabToUpdate of entitiesToUpdate) {
      const { widgets: _widgets, ...updateData } = tabToUpdate;

      await this.pageLayoutTabService.update(
        tabToUpdate.id,
        workspaceId,
        updateData,
        transactionManager,
      );
    }

    for (const tabToCreate of entitiesToCreate) {
      await this.pageLayoutTabService.create(
        {
          ...tabToCreate,
          pageLayoutId,
        },
        workspaceId,
        transactionManager,
      );
    }

    for (const tabInput of tabs) {
      await this.updateWidgetsForTab({
        tabId: tabInput.id,
        widgets: tabInput.widgets,
        workspaceId,
        transactionManager,
      });
    }
  }

  private async updateWidgetsForTab({
    tabId,
    widgets,
    workspaceId,
    transactionManager,
  }: UpdateWidgetsForTabParams): Promise<void> {
    const existingWidgets =
      await this.pageLayoutWidgetService.findByPageLayoutTabId(
        workspaceId,
        tabId,
        transactionManager,
      );

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      idsToDelete,
    } = computeDiffBetweenObjects<
      PageLayoutWidgetEntity,
      UpdatePageLayoutWidgetWithIdInput
    >({
      existingObjects: existingWidgets,
      receivedObjects: widgets,
      propertiesToCompare: [
        'pageLayoutTabId',
        'objectMetadataId',
        'title',
        'type',
        'gridPosition',
        'configuration',
      ],
    });

    for (const widgetId of idsToDelete) {
      await this.pageLayoutWidgetService.delete(
        widgetId,
        workspaceId,
        transactionManager,
      );
    }

    for (const widgetUpdate of entitiesToUpdate) {
      let validatedConfig: WidgetConfigurationInterface | null = null;

      if (widgetUpdate.configuration && widgetUpdate.type) {
        try {
          validatedConfig = validateAndTransformWidgetConfiguration(
            widgetUpdate.type,
            widgetUpdate.configuration,
          );
        } catch (error) {
          throw new Error(
            `Invalid configuration for widget ${widgetUpdate.id} of type ${widgetUpdate.type}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        if (!validatedConfig) {
          throw new Error(
            `Invalid configuration for widget ${widgetUpdate.id} of type ${widgetUpdate.type}`,
          );
        }
      }

      await this.pageLayoutWidgetService.update(
        widgetUpdate.id,
        workspaceId,
        {
          ...widgetUpdate,
          ...(validatedConfig && { configuration: validatedConfig }),
        } as UpdatePageLayoutWidgetInput,
        transactionManager,
      );
    }

    for (const widgetToCreate of entitiesToCreate) {
      let validatedConfig: WidgetConfigurationInterface | null = null;

      if (widgetToCreate.configuration && widgetToCreate.type) {
        try {
          validatedConfig = validateAndTransformWidgetConfiguration(
            widgetToCreate.type,
            widgetToCreate.configuration,
          );
        } catch (error) {
          throw new Error(
            `Invalid configuration for new widget of type ${widgetToCreate.type}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        if (!validatedConfig) {
          throw new Error(
            `Invalid configuration for new widget of type ${widgetToCreate.type}`,
          );
        }
      }

      await this.pageLayoutWidgetService.create(
        {
          ...widgetToCreate,
          ...(validatedConfig && { configuration: validatedConfig }),
        } as CreatePageLayoutWidgetInput,
        workspaceId,
        transactionManager,
      );
    }
  }
}
