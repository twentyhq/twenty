import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { View } from 'src/engine/core-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view.exception';

@Injectable()
export class ViewService {
  constructor(
    @InjectRepository(View, 'core')
    private readonly viewRepository: Repository<View>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<View[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });
  }

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
  ): Promise<View[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        objectMetadataId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });
  }

  async findById(id: string, workspaceId: string): Promise<View | null> {
    const view = await this.viewRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });

    return view || null;
  }

  async create(viewData: Partial<View>): Promise<View> {
    if (!isDefined(viewData.workspaceId)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewData.objectMetadataId)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
        ),
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    const view = this.viewRepository.create({
      ...viewData,
      isCustom: true,
    });

    return this.viewRepository.save(view);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<View>,
  ): Promise<View> {
    const existingView = await this.findById(id, workspaceId);

    if (!isDefined(existingView)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const updatedView = await this.viewRepository.save({
      id,
      ...updateData,
    });

    return { ...existingView, ...updatedView };
  }

  async delete(id: string, workspaceId: string): Promise<View> {
    const view = await this.findById(id, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.viewRepository.softDelete(id);

    return view;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const view = await this.findById(id, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.viewRepository.delete(id);

    return true;
  }
}
