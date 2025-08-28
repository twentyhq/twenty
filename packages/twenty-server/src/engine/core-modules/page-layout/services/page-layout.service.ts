import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';

@Injectable()
export class PageLayoutService {
  constructor(
    @InjectRepository(PageLayoutEntity, 'core')
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<PageLayoutEntity[]> {
    return this.pageLayoutRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['tabs'],
    });
  }

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
  ): Promise<PageLayoutEntity[]> {
    return this.pageLayoutRepository.find({
      where: {
        workspaceId,
        objectMetadataId,
        deletedAt: IsNull(),
      },
      relations: ['tabs'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutEntity | null> {
    const pageLayout = await this.pageLayoutRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['tabs'],
    });

    return pageLayout || null;
  }

  async create(
    pageLayoutData: Partial<PageLayoutEntity>,
  ): Promise<PageLayoutEntity> {
    if (!isDefined(pageLayoutData.workspaceId)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      );
    }

    if (!isDefined(pageLayoutData.name)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.NAME_REQUIRED,
        ),
        PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      );
    }

    const pageLayout = this.pageLayoutRepository.create(pageLayoutData);

    return this.pageLayoutRepository.save(pageLayout);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<PageLayoutEntity>,
  ): Promise<PageLayoutEntity> {
    const existingPageLayout = await this.findById(id, workspaceId);

    if (!isDefined(existingPageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    const updatedPageLayout = await this.pageLayoutRepository.save({
      id,
      ...updateData,
    });

    return { ...existingPageLayout, ...updatedPageLayout };
  }

  async delete(id: string, workspaceId: string): Promise<PageLayoutEntity> {
    const pageLayout = await this.findById(id, workspaceId);

    if (!isDefined(pageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    await this.pageLayoutRepository.softDelete(id);

    return pageLayout;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const pageLayout = await this.findById(id, workspaceId);

    if (!isDefined(pageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    await this.pageLayoutRepository.delete(id);

    return true;
  }

  async restore(id: string, workspaceId: string): Promise<PageLayoutEntity> {
    const pageLayout = await this.findById(id, workspaceId);

    if (!isDefined(pageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    await this.pageLayoutRepository.restore(id);

    return pageLayout;
  }
}
