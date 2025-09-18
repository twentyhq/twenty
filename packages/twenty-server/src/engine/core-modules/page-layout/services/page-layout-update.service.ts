import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget-with-id.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { computeDiffBetweenExistingEntitiesAndInput } from 'src/engine/core-modules/page-layout/utils/compute-diff-between-existing-entities-and-input';

@Injectable()
export class PageLayoutUpdateService {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {}

  async updatePageLayoutWithTabs(
    id: string,
    workspaceId: string,
    input: UpdatePageLayoutWithTabsInput,
    transactionManager: EntityManager,
  ): Promise<PageLayoutEntity> {
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

    await this.updatePageLayoutTabs(id, workspaceId, tabs, transactionManager);

    return this.pageLayoutService.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );
  }

  private async updatePageLayoutTabs(
    pageLayoutId: string,
    workspaceId: string,
    tabs: UpdatePageLayoutTabWithWidgetsInput[],
    transactionManager: EntityManager,
  ): Promise<void> {
    const existingTabs = await this.pageLayoutTabService.findByPageLayoutId(
      workspaceId,
      pageLayoutId,
      transactionManager,
    );

    const { entitiesToCreate, entitiesToUpdate, idsToDelete } =
      computeDiffBetweenExistingEntitiesAndInput<
        PageLayoutTabEntity,
        UpdatePageLayoutTabWithWidgetsInput
      >(existingTabs, tabs, ['title', 'position']);

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
      await this.updateWidgetsForTab(
        tabInput.id,
        tabInput.widgets,
        workspaceId,
        transactionManager,
      );
    }
  }

  private async updateWidgetsForTab(
    tabId: string,
    widgets: UpdatePageLayoutWidgetWithIdInput[],
    workspaceId: string,
    transactionManager: EntityManager,
  ): Promise<void> {
    const existingWidgets =
      await this.pageLayoutWidgetService.findByPageLayoutTabId(
        workspaceId,
        tabId,
        transactionManager,
      );

    const { entitiesToCreate, entitiesToUpdate, idsToDelete } =
      computeDiffBetweenExistingEntitiesAndInput<
        PageLayoutWidgetEntity,
        UpdatePageLayoutWidgetWithIdInput
      >(existingWidgets, widgets, [
        'pageLayoutTabId',
        'objectMetadataId',
        'title',
        'type',
        'gridPosition',
        'configuration',
      ]);

    for (const widgetId of idsToDelete) {
      await this.pageLayoutWidgetService.delete(
        widgetId,
        workspaceId,
        transactionManager,
      );
    }

    for (const widgetUpdate of entitiesToUpdate) {
      await this.pageLayoutWidgetService.update(
        widgetUpdate.id,
        workspaceId,
        widgetUpdate,
        transactionManager,
      );
    }

    for (const widgetToCreate of entitiesToCreate) {
      await this.pageLayoutWidgetService.create(
        widgetToCreate,
        workspaceId,
        transactionManager,
      );
    }
  }
}
