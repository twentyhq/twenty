import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessageKey,
  generateViewFilterGroupExceptionMessage,
  generateViewFilterGroupUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-filter-group.exception';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';

@Injectable()
export class ViewFilterGroupService {
  constructor(
    @InjectRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroupEntity>,
    private readonly viewService: ViewService,
  ) {}

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<ViewFilterGroupEntity[]> {
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
  ): Promise<ViewFilterGroupEntity[]> {
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
  ): Promise<ViewFilterGroupEntity | null> {
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
    viewFilterGroupData: Partial<ViewFilterGroupEntity>,
  ): Promise<ViewFilterGroupEntity> {
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

    await this.viewService.flushGraphQLCache(viewFilterGroupData.workspaceId);

    const savedViewFilterGroup =
      await this.viewFilterGroupRepository.save(viewFilterGroup);

    await this.viewService.flushGraphQLCache(viewFilterGroupData.workspaceId);

    return savedViewFilterGroup;
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewFilterGroupEntity>,
  ): Promise<ViewFilterGroupEntity> {
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

    await this.viewService.flushGraphQLCache(workspaceId);

    return { ...existingViewFilterGroup, ...updatedViewFilterGroup };
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilterGroupEntity> {
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

    await this.viewService.flushGraphQLCache(workspaceId);

    return true;
  }
}
