import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
  generateViewFieldExceptionMessage,
  generateViewFieldUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';

@Injectable()
export class ViewFieldService {
  constructor(
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewFieldEntity[]> {
    return this.viewFieldRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFieldEntity[]> {
    return this.viewFieldRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewFieldEntity | null> {
    const viewField = await this.viewFieldRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });

    return viewField || null;
  }

  async create(
    viewFieldData: Partial<ViewFieldEntity>,
  ): Promise<ViewFieldEntity> {
    if (!isDefined(viewFieldData.workspaceId)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        {
          userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
            ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewFieldData.viewId)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED,
        ),
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        {
          userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewFieldData.fieldMetadataId)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
        ),
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        {
          userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
            ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    try {
      const viewField = this.viewFieldRepository.create(viewFieldData);

      return await this.viewFieldRepository.save(viewField);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ViewFieldException(
          generateViewFieldExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS,
          ),
          ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
          {
            userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
              ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS,
            ),
          },
        );
      }

      throw error;
    }
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewFieldEntity>,
  ): Promise<ViewFieldEntity> {
    const existingViewField = await this.findById(id, workspaceId);

    if (!isDefined(existingViewField)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          id,
        ),
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
      );
    }

    const updatedViewField = await this.viewFieldRepository.save({
      id,
      ...updateData,
    });

    return { ...existingViewField, ...updatedViewField };
  }

  async delete(id: string, workspaceId: string): Promise<ViewFieldEntity> {
    const viewField = await this.findById(id, workspaceId);

    if (!isDefined(viewField)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          id,
        ),
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
      );
    }

    await this.viewFieldRepository.softDelete(id);

    return viewField;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const viewField = await this.findById(id, workspaceId);

    if (!isDefined(viewField)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          id,
        ),
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
      );
    }

    await this.viewFieldRepository.delete(id);

    return true;
  }
}
