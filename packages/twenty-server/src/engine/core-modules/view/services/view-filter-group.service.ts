import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
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

  async findByParentViewFilterGroupId(
    workspaceId: string,
    parentViewFilterGroupId: string,
  ): Promise<ViewFilterGroup[]> {
    return this.viewFilterGroupRepository.find({
      where: {
        workspaceId,
        parentViewFilterGroupId,
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
    if (!viewFilterGroupData.workspaceId) {
      throw new ViewFilterGroupException(
        'WorkspaceId is required',
        ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        {
          userFriendlyMessage:
            'WorkspaceId is required to create a view filter group.',
        },
      );
    }

    if (!viewFilterGroupData.viewId) {
      throw new ViewFilterGroupException(
        'ViewId is required',
        ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        {
          userFriendlyMessage:
            'ViewId is required to create a view filter group.',
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
  ): Promise<ViewFilterGroup | null> {
    const viewFilterGroup = await this.findById(id, workspaceId);

    if (!viewFilterGroup) {
      return null;
    }

    await this.viewFilterGroupRepository.update(id, updateData);

    return this.findById(id, workspaceId);
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilterGroup | null> {
    const viewFilterGroup = await this.findById(id, workspaceId);

    if (!viewFilterGroup) {
      return null;
    }

    await this.viewFilterGroupRepository.softDelete(id);

    return viewFilterGroup;
  }

  async validateViewFilterGroup(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilterGroup> {
    const viewFilterGroup = await this.findById(id, workspaceId);

    if (!viewFilterGroup) {
      throw new ViewFilterGroupException(
        `ViewFilterGroup with id ${id} not found`,
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    return viewFilterGroup;
  }

  async bulkDeleteByViewId(workspaceId: string, viewId: string): Promise<void> {
    await this.viewFilterGroupRepository.softDelete({
      workspaceId,
      viewId,
    });
  }

  async bulkDeleteByParentViewFilterGroupId(
    workspaceId: string,
    parentViewFilterGroupId: string,
  ): Promise<void> {
    await this.viewFilterGroupRepository.softDelete({
      workspaceId,
      parentViewFilterGroupId,
    });
  }
}
