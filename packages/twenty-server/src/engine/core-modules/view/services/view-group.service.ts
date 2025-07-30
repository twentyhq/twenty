import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/core-modules/view/exceptions/view-group.exception';

@Injectable()
export class ViewGroupService {
  constructor(
    @InjectRepository(ViewGroup, 'core')
    private readonly viewGroupRepository: Repository<ViewGroup>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewGroup[]> {
    return this.viewGroupRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewGroup[]> {
    return this.viewGroupRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewGroup | null> {
    const viewGroup = await this.viewGroupRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return viewGroup || null;
  }

  async create(viewGroupData: Partial<ViewGroup>): Promise<ViewGroup> {
    if (!isDefined(viewGroupData.workspaceId)) {
      throw new ViewGroupException(
        'WorkspaceId is required',
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
        {
          userFriendlyMessage:
            'WorkspaceId is required to create a view group.',
        },
      );
    }

    if (!isDefined(viewGroupData.viewId)) {
      throw new ViewGroupException(
        'ViewId is required',
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
        { userFriendlyMessage: 'ViewId is required to create a view group.' },
      );
    }

    if (!isDefined(viewGroupData.fieldMetadataId)) {
      throw new ViewGroupException(
        'FieldMetadataId is required',
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
        {
          userFriendlyMessage:
            'FieldMetadataId is required to create a view group.',
        },
      );
    }

    const viewGroup = this.viewGroupRepository.create(viewGroupData);

    return this.viewGroupRepository.save(viewGroup);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewGroup>,
  ): Promise<ViewGroup> {
    const existingViewGroup = await this.findById(id, workspaceId);

    if (!isDefined(existingViewGroup)) {
      throw new ViewGroupException(
        `ViewGroup with id ${id} not found`,
        ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
      );
    }

    const updatedViewGroup = await this.viewGroupRepository.save({
      id,
      ...updateData,
    });

    return { ...existingViewGroup, ...updatedViewGroup };
  }

  async delete(id: string, workspaceId: string): Promise<ViewGroup> {
    const viewGroup = await this.findById(id, workspaceId);

    if (!isDefined(viewGroup)) {
      throw new ViewGroupException(
        `ViewGroup with id ${id} not found`,
        ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
      );
    }

    await this.viewGroupRepository.softDelete(id);

    return viewGroup;
  }
}
