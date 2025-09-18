import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { EntityManager } from 'typeorm';

import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget-with-id.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { computeIdsDiff } from 'src/engine/core-modules/page-layout/utils/compute-ids-diff';

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

    if (isDefined(tabs)) {
      await this.updatePageLayoutTabs(
        id,
        workspaceId,
        tabs,
        transactionManager,
      );
    }

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
    if (!tabs) return;

    const existingTabs = await this.pageLayoutTabService.findByPageLayoutId(
      workspaceId,
      pageLayoutId,
      transactionManager,
    );

    const { idsToCreate, idsToDelete, idsToUpdate } = computeIdsDiff(
      existingTabs.map((tab) => tab.id),
      tabs.map((tab) => tab.id),
    );

    const tabsToUpdate = tabs.filter((tab) => idsToUpdate.includes(tab.id));
    const tabsToCreate = tabs.filter((tab) => idsToCreate.includes(tab.id));

    for (const tabId of idsToDelete) {
      await this.pageLayoutTabService.delete(
        tabId,
        workspaceId,
        transactionManager,
      );
    }

    for (const tabToUpdate of tabsToUpdate) {
      const { widgets: _widgets, ...updateData } = tabToUpdate;

      await this.pageLayoutTabService.update(
        tabToUpdate.id,
        workspaceId,
        updateData,
        transactionManager,
      );
    }

    for (const tabToCreate of tabsToCreate) {
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

    const { idsToCreate, idsToDelete, idsToUpdate } = computeIdsDiff(
      existingWidgets.map((widget) => widget.id),
      widgets.map((widget) => widget.id),
    );

    const widgetsToUpdate = widgets.filter((widget) =>
      idsToUpdate.includes(widget.id),
    );
    const widgetsToCreate = widgets.filter((widget) =>
      idsToCreate.includes(widget.id),
    );

    for (const widgetId of idsToDelete) {
      await this.pageLayoutWidgetService.delete(
        widgetId,
        workspaceId,
        transactionManager,
      );
    }

    for (const widgetUpdate of widgetsToUpdate) {
      await this.pageLayoutWidgetService.update(
        widgetUpdate.id,
        workspaceId,
        widgetUpdate,
        transactionManager,
      );
    }

    for (const widgetToCreate of widgetsToCreate) {
      await this.pageLayoutWidgetService.create(
        widgetToCreate,
        workspaceId,
        transactionManager,
      );
    }
  }
}
