import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
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
    @InjectRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
  ) {}

  private getPageLayoutRepository(
    transactionManager?: EntityManager,
  ): Repository<PageLayoutEntity> {
    return transactionManager
      ? transactionManager.getRepository(PageLayoutEntity)
      : this.pageLayoutRepository;
  }

  async findByWorkspaceId(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutEntity[]> {
    const repository = this.getPageLayoutRepository(transactionManager);

    return repository.find({
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
    transactionManager?: EntityManager,
  ): Promise<PageLayoutEntity[]> {
    const repository = this.getPageLayoutRepository(transactionManager);

    return repository.find({
      where: {
        workspaceId,
        objectMetadataId,
        deletedAt: IsNull(),
      },
      relations: ['tabs'],
    });
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutEntity> {
    const repository = this.getPageLayoutRepository(transactionManager);

    const pageLayout = await repository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['tabs'],
    });

    if (!isDefined(pageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    return pageLayout;
  }

  async create(
    pageLayoutData: CreatePageLayoutInput,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutEntity> {
    if (!isDefined(pageLayoutData.name)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.NAME_REQUIRED,
        ),
        PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      );
    }

    const repository = this.getPageLayoutRepository(transactionManager);

    const insertResult = await repository.insert({
      ...pageLayoutData,
      workspaceId,
    });

    return this.findByIdOrThrow(
      insertResult.identifiers[0].id,
      workspaceId,
      transactionManager,
    );
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: QueryDeepPartialEntity<PageLayoutEntity>,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutEntity> {
    const repository = this.getPageLayoutRepository(transactionManager);

    await repository.update({ id, workspaceId }, updateData);

    const updatedPageLayout = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    return updatedPageLayout;
  }

  async delete(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutEntity> {
    const pageLayout = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    const repository = this.getPageLayoutRepository(transactionManager);

    await repository.softDelete(id);

    return pageLayout;
  }

  async destroy(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutEntity> {
    const repository = this.getPageLayoutRepository(transactionManager);

    const pageLayout = await repository.findOne({
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    await repository.delete(id);

    return pageLayout;
  }

  async restore(id: string, workspaceId: string): Promise<PageLayoutEntity> {
    const pageLayout = await this.pageLayoutRepository.findOne({
      select: {
        id: true,
        deletedAt: true,
      },
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    if (!isDefined(pageLayout.deletedAt)) {
      throw new PageLayoutException(
        'Page layout is not deleted and cannot be restored',
        PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      );
    }

    await this.pageLayoutRepository.restore(id);

    const restoredPageLayout = await this.findByIdOrThrow(id, workspaceId);

    return restoredPageLayout;
  }
}
