import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class PageLayoutService {
  private readonly logger = new Logger(PageLayoutService.name);

  constructor(
    @InjectRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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
      relations: ['tabs', 'tabs.widgets'],
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
      relations: ['tabs', 'tabs.widgets'],
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
      relations: ['tabs', 'tabs.widgets'],
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

    if (pageLayout.type === PageLayoutType.DASHBOARD) {
      await this.destroyAssociatedDashboards(id, workspaceId);
    }

    await repository.delete(id);

    return pageLayout;
  }

  private async destroyAssociatedDashboards(
    pageLayoutId: string,
    workspaceId: string,
  ): Promise<void> {
    try {
      const dashboardRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          'dashboard',
          { shouldBypassPermissionChecks: true },
        );

      const dashboards = await dashboardRepository.find({
        where: {
          pageLayoutId,
        },
      });

      for (const dashboard of dashboards) {
        await dashboardRepository.delete(dashboard.id);
      }
    } catch (error) {
      this.logger.error(
        `Failed to destroy associated dashboards for page layout ${pageLayoutId}: ${error}`,
      );
    }
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
