import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { EntityManager } from 'typeorm';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import {
  generatePageLayoutExceptionMessage,
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';

@Injectable()
export class PageLayoutDuplicationService {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {}

  async duplicate({
    pageLayoutId,
    workspaceId,
    transactionManager,
  }: {
    pageLayoutId: string;
    workspaceId: string;
    transactionManager?: EntityManager;
  }): Promise<PageLayoutEntity> {
    const originalPageLayout = await this.pageLayoutService.findByIdOrThrow(
      pageLayoutId,
      workspaceId,
      transactionManager,
    );

    const { name, type, objectMetadataId } = originalPageLayout;

    const newPageLayout = await this.pageLayoutService.create(
      {
        name,
        type,
        objectMetadataId,
      },
      workspaceId,
      transactionManager,
    );

    const originalTabIdToNewTabIdMap = await this.duplicateTabs({
      originalTabs: originalPageLayout.tabs,
      newPageLayoutId: newPageLayout.id,
      workspaceId,
      transactionManager,
    });

    await this.duplicateWidgets({
      originalWidgets: originalPageLayout.tabs.flatMap((tab) => tab.widgets),
      originalTabIdToNewTabIdMap,
      workspaceId,
      transactionManager,
    });

    return newPageLayout;
  }

  private async duplicateTabs({
    originalTabs,
    newPageLayoutId,
    workspaceId,
    transactionManager,
  }: {
    originalTabs: PageLayoutTabEntity[];
    newPageLayoutId: string;
    workspaceId: string;
    transactionManager?: EntityManager;
  }): Promise<Map<string, string>> {
    const originalTabIdToNewTabIdMap = new Map<string, string>();

    if (!isDefined(originalTabs) || originalTabs.length === 0) {
      return originalTabIdToNewTabIdMap;
    }

    for (const originalTab of originalTabs) {
      const { title, position } = originalTab;

      const newTab = await this.pageLayoutTabService.create(
        {
          title,
          position,
          pageLayoutId: newPageLayoutId,
        },
        workspaceId,
        transactionManager,
      );

      originalTabIdToNewTabIdMap.set(originalTab.id, newTab.id);
    }

    return originalTabIdToNewTabIdMap;
  }

  private async duplicateWidgets({
    originalWidgets,
    originalTabIdToNewTabIdMap,
    workspaceId,
    transactionManager,
  }: {
    originalWidgets: PageLayoutWidgetEntity[];
    originalTabIdToNewTabIdMap: Map<string, string>;
    workspaceId: string;
    transactionManager?: EntityManager;
  }): Promise<void> {
    if (originalWidgets.length === 0) {
      return;
    }

    for (const originalWidget of originalWidgets) {
      const newTabId = originalTabIdToNewTabIdMap.get(
        originalWidget.pageLayoutTabId,
      );

      if (!isDefined(newTabId)) {
        throw new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.TAB_NOT_FOUND_FOR_WIDGET_DUPLICATION,
            originalWidget.pageLayoutTabId,
          ),
          PageLayoutExceptionCode.TAB_NOT_FOUND_FOR_WIDGET_DUPLICATION,
        );
      }

      await this.pageLayoutWidgetService.create(
        {
          title: originalWidget.title,
          gridPosition: originalWidget.gridPosition,
          type: originalWidget.type,
          objectMetadataId: originalWidget.objectMetadataId,
          configuration: originalWidget.configuration as Record<
            string,
            unknown
          > | null,
          pageLayoutTabId: newTabId,
        },
        workspaceId,
        transactionManager,
      );
    }
  }
}
