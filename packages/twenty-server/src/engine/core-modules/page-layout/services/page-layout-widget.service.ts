import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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

@Injectable()
export class PageLayoutWidgetService {
  constructor(
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    private readonly pageLayoutTabService: PageLayoutTabService,
  ) {}

  async findByPageLayoutTabId(
    workspaceId: string,
    pageLayoutTabId: string,
  ): Promise<PageLayoutWidgetEntity[]> {
    return this.pageLayoutWidgetRepository.find({
      where: {
        pageLayoutTabId,
        pageLayoutTab: { pageLayout: { workspaceId } },
        deletedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutWidgetEntity> {
    const pageLayoutWidget = await this.pageLayoutWidgetRepository.findOne({
      where: {
        id,
        pageLayoutTab: { pageLayout: { workspaceId } },
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
    pageLayoutWidgetData: Partial<PageLayoutWidgetEntity>,
    workspaceId: string,
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

    try {
      await this.pageLayoutTabService.findByIdOrThrow(
        pageLayoutWidgetData.pageLayoutTabId,
        workspaceId,
      );

      const pageLayoutWidget =
        this.pageLayoutWidgetRepository.create(pageLayoutWidgetData);

      return this.pageLayoutWidgetRepository.save(pageLayoutWidget);
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
    updateData: QueryDeepPartialEntity<PageLayoutWidgetEntity>,
  ): Promise<PageLayoutWidgetEntity> {
    const existingWidget = await this.pageLayoutWidgetRepository.findOne({
      where: {
        id,
        pageLayoutTab: { pageLayout: { workspaceId } },
      },
      relations: ['pageLayoutTab'],
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

    await this.pageLayoutWidgetRepository.update({ id }, updateData);

    return this.findByIdOrThrow(id, workspaceId);
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutWidgetEntity> {
    const pageLayoutWidget = await this.findByIdOrThrow(id, workspaceId);

    await this.pageLayoutWidgetRepository.softDelete(id);

    return pageLayoutWidget;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const pageLayoutWidget = await this.pageLayoutWidgetRepository.findOne({
      where: {
        id,
        pageLayoutTab: { pageLayout: { workspaceId } },
      },
      withDeleted: true,
      relations: ['pageLayoutTab'],
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

    await this.pageLayoutWidgetRepository.delete(id);

    return true;
  }

  async restore(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutWidgetEntity> {
    const pageLayoutWidget = await this.pageLayoutWidgetRepository.findOne({
      select: {
        id: true,
        deletedAt: true,
      },
      where: {
        id,
        pageLayoutTab: { pageLayout: { workspaceId } },
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

    await this.pageLayoutWidgetRepository.restore(id);

    const restoredPageLayoutWidget = await this.findByIdOrThrow(
      id,
      workspaceId,
    );

    return restoredPageLayoutWidget;
  }
}
