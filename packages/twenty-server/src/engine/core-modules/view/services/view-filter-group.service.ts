import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessage,
  ViewFilterGroupExceptionUserFriendlyMessage,
} from 'src/engine/core-modules/view/exceptions/view-filter-group.exception';

@Injectable()
export class ViewFilterGroupService {
  constructor(
    @InjectRepository(ViewFilterGroup, 'core')
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroup>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewFilterGroup[]> {
    return this.viewFilterGroupRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFilterGroup[]> {
    return this.viewFilterGroupRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilterGroup | null> {
    const viewFilterGroup = await this.viewFilterGroupRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return viewFilterGroup || null;
  }

  async create(
    viewFilterGroupData: Partial<ViewFilterGroup>,
  ): Promise<ViewFilterGroup> {
    if (!isDefined(viewFilterGroupData.workspaceId)) {
      throw new ViewFilterGroupException(
        ViewFilterGroupExceptionMessage.WORKSPACE_ID_REQUIRED,
        ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        {
          userFriendlyMessage:
            ViewFilterGroupExceptionUserFriendlyMessage.WORKSPACE_ID_REQUIRED,
        },
      );
    }

    if (!isDefined(viewFilterGroupData.viewId)) {
      throw new ViewFilterGroupException(
        ViewFilterGroupExceptionMessage.VIEW_ID_REQUIRED,
        ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        {
          userFriendlyMessage:
            ViewFilterGroupExceptionUserFriendlyMessage.VIEW_ID_REQUIRED,
        },
      );
    }

    const viewFilterGroup =
      this.viewFilterGroupRepository.create(viewFilterGroupData);

    return this.viewFilterGroupRepository.save(viewFilterGroup);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewFilterGroup>,
  ): Promise<ViewFilterGroup> {
    const existingViewFilterGroup = await this.findById(id, workspaceId);

    if (!isDefined(existingViewFilterGroup)) {
      throw new ViewFilterGroupException(
        ViewFilterGroupExceptionMessage.VIEW_FILTER_GROUP_NOT_FOUND,
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    const updatedViewFilterGroup = await this.viewFilterGroupRepository.save({
      id,
      ...updateData,
    });

    return { ...existingViewFilterGroup, ...updatedViewFilterGroup };
  }

  async delete(id: string, workspaceId: string): Promise<ViewFilterGroup> {
    const viewFilterGroup = await this.findById(id, workspaceId);

    if (!isDefined(viewFilterGroup)) {
      throw new ViewFilterGroupException(
        ViewFilterGroupExceptionMessage.VIEW_FILTER_GROUP_NOT_FOUND,
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    await this.viewFilterGroupRepository.softDelete(id);

    return viewFilterGroup;
  }
}
