import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessageKey,
  generateViewFilterGroupExceptionMessage,
  generateViewFilterGroupUserFriendlyExceptionMessage,
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
      relations: [
        'workspace',
        'view',
        'viewFilters',
        'parentViewFilterGroup',
        'childViewFilterGroups',
      ],
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
      relations: [
        'workspace',
        'view',
        'viewFilters',
        'parentViewFilterGroup',
        'childViewFilterGroups',
      ],
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
      relations: [
        'workspace',
        'view',
        'viewFilters',
        'parentViewFilterGroup',
        'childViewFilterGroups',
      ],
    });

    return viewFilterGroup || null;
  }

  async create(
    viewFilterGroupData: Partial<ViewFilterGroup>,
  ): Promise<ViewFilterGroup> {
    if (!isDefined(viewFilterGroupData.workspaceId)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
            ),
        },
      );
    }

    if (!isDefined(viewFilterGroupData.viewId)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_ID_REQUIRED,
        ),
        ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.VIEW_ID_REQUIRED,
            ),
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
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
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
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    await this.viewFilterGroupRepository.softDelete(id);

    return viewFilterGroup;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const viewFilterGroup = await this.findById(id, workspaceId);

    if (!isDefined(viewFilterGroup)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    await this.viewFilterGroupRepository.delete(id);

    return true;
  }
}
