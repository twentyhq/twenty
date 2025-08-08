import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
  ViewFilterExceptionMessageKey,
  generateViewFilterExceptionMessage,
  generateViewFilterUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-filter.exception';

@Injectable()
export class ViewFilterService {
  constructor(
    @InjectRepository(ViewFilter, 'core')
    private readonly viewFilterRepository: Repository<ViewFilter>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewFilter[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFilter[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewFilter | null> {
    const viewFilter = await this.viewFilterRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });

    return viewFilter || null;
  }

  async create(viewFilterData: Partial<ViewFilter>): Promise<ViewFilter> {
    if (!isDefined(viewFilterData.workspaceId)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewFilterData.viewId)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED,
        ),
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewFilterData.fieldMetadataId)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
        ),
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    const viewFilter = this.viewFilterRepository.create(viewFilterData);

    return this.viewFilterRepository.save(viewFilter);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewFilter>,
  ): Promise<ViewFilter> {
    const existingViewFilter = await this.findById(id, workspaceId);

    if (!isDefined(existingViewFilter)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      );
    }

    const updatedViewFilter = await this.viewFilterRepository.save({
      id,
      ...updateData,
    });

    return { ...existingViewFilter, ...updatedViewFilter };
  }

  async delete(id: string, workspaceId: string): Promise<ViewFilter> {
    const viewFilter = await this.findById(id, workspaceId);

    if (!isDefined(viewFilter)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      );
    }

    await this.viewFilterRepository.softDelete(id);

    return viewFilter;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const viewFilter = await this.findById(id, workspaceId);

    if (!isDefined(viewFilter)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      );
    }

    await this.viewFilterRepository.delete(id);

    return true;
  }
}
