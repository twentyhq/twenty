import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import {
  ViewSortException,
  ViewSortExceptionCode,
  ViewSortExceptionMessage,
  ViewSortExceptionUserFriendlyMessage,
} from 'src/engine/core-modules/view/exceptions/view-sort.exception';

@Injectable()
export class ViewSortService {
  constructor(
    @InjectRepository(ViewSort, 'core')
    private readonly viewSortRepository: Repository<ViewSort>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewSort[]> {
    return this.viewSortRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });
  }

  async findByViewId(workspaceId: string, viewId: string): Promise<ViewSort[]> {
    return this.viewSortRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewSort | null> {
    const viewSort = await this.viewSortRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });

    return viewSort || null;
  }

  async create(viewSortData: Partial<ViewSort>): Promise<ViewSort> {
    if (!isDefined(viewSortData.workspaceId)) {
      throw new ViewSortException(
        ViewSortExceptionMessage.WORKSPACE_ID_REQUIRED,
        ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        {
          userFriendlyMessage:
            ViewSortExceptionUserFriendlyMessage.WORKSPACE_ID_REQUIRED,
        },
      );
    }

    if (!isDefined(viewSortData.viewId)) {
      throw new ViewSortException(
        ViewSortExceptionMessage.VIEW_ID_REQUIRED,
        ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        {
          userFriendlyMessage:
            ViewSortExceptionUserFriendlyMessage.VIEW_ID_REQUIRED,
        },
      );
    }

    if (!isDefined(viewSortData.fieldMetadataId)) {
      throw new ViewSortException(
        ViewSortExceptionMessage.FIELD_METADATA_ID_REQUIRED,
        ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        {
          userFriendlyMessage:
            ViewSortExceptionUserFriendlyMessage.FIELD_METADATA_ID_REQUIRED,
        },
      );
    }

    const viewSort = this.viewSortRepository.create(viewSortData);

    return this.viewSortRepository.save(viewSort);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewSort>,
  ): Promise<ViewSort> {
    const existingViewSort = await this.findById(id, workspaceId);

    if (!isDefined(existingViewSort)) {
      throw new ViewSortException(
        ViewSortExceptionMessage.VIEW_SORT_NOT_FOUND,
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
      );
    }

    const updatedViewSort = await this.viewSortRepository.save({
      id,
      ...updateData,
    });

    return { ...existingViewSort, ...updatedViewSort };
  }

  async delete(id: string, workspaceId: string): Promise<ViewSort> {
    const viewSort = await this.findById(id, workspaceId);

    if (!isDefined(viewSort)) {
      throw new ViewSortException(
        ViewSortExceptionMessage.VIEW_SORT_NOT_FOUND,
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
      );
    }

    await this.viewSortRepository.softDelete(id);

    return viewSort;
  }
}
