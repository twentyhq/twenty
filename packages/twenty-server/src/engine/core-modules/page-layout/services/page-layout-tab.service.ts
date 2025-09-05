import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
  generatePageLayoutTabExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';

@Injectable()
export class PageLayoutTabService {
  constructor(
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    private readonly pageLayoutService: PageLayoutService,
  ) {}

  async findByPageLayoutId(
    workspaceId: string,
    pageLayoutId: string,
  ): Promise<PageLayoutTabEntity[]> {
    return this.pageLayoutTabRepository.find({
      where: {
        pageLayoutId,
        pageLayout: { workspaceId },
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['widgets'],
    });
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutTabEntity> {
    const pageLayoutTab = await this.pageLayoutTabRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['widgets'],
    });

    if (!isDefined(pageLayoutTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    return pageLayoutTab;
  }

  async create(
    pageLayoutTabData: Partial<PageLayoutTabEntity>,
    workspaceId: string,
  ): Promise<PageLayoutTabEntity> {
    if (!isDefined(pageLayoutTabData.title)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.TITLE_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    if (!isDefined(pageLayoutTabData.pageLayoutId)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    try {
      await this.pageLayoutService.findByIdOrThrow(
        pageLayoutTabData.pageLayoutId,
        workspaceId,
      );

      const pageLayoutTab = this.pageLayoutTabRepository.create({
        ...pageLayoutTabData,
        workspaceId,
      });

      return this.pageLayoutTabRepository.save(pageLayoutTab);
    } catch (error) {
      if (
        error instanceof PageLayoutException &&
        error.code === PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND
      ) {
        throw new PageLayoutTabException(
          generatePageLayoutTabExceptionMessage(
            PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          ),
          PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: QueryDeepPartialEntity<PageLayoutTabEntity>,
  ): Promise<PageLayoutTabEntity> {
    const existingTab = await this.pageLayoutTabRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(existingTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    await this.pageLayoutTabRepository.update({ id }, updateData);

    return this.findByIdOrThrow(id, workspaceId);
  }

  async delete(id: string, workspaceId: string): Promise<PageLayoutTabEntity> {
    const pageLayoutTab = await this.findByIdOrThrow(id, workspaceId);

    await this.pageLayoutTabRepository.softDelete(id);

    return pageLayoutTab;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const pageLayoutTab = await this.pageLayoutTabRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    await this.pageLayoutTabRepository.delete(id);

    return true;
  }

  async restore(id: string, workspaceId: string): Promise<PageLayoutTabEntity> {
    const pageLayoutTab = await this.pageLayoutTabRepository.findOne({
      select: {
        id: true,
        deletedAt: true,
        pageLayoutId: true,
      },
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutTab)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    if (!isDefined(pageLayoutTab.deletedAt)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_DELETED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    try {
      await this.pageLayoutService.findByIdOrThrow(
        pageLayoutTab.pageLayoutId,
        workspaceId,
      );
    } catch (error) {
      if (
        error instanceof PageLayoutException &&
        error.code === PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND
      ) {
        throw new PageLayoutTabException(
          generatePageLayoutTabExceptionMessage(
            PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          ),
          PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
        );
      }
      throw error;
    }

    await this.pageLayoutTabRepository.restore(id);

    const restoredPageLayoutTab = await this.findByIdOrThrow(id, workspaceId);

    return restoredPageLayoutTab;
  }
}
