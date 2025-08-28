import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
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
    @InjectRepository(ViewField, 'core')
    private readonly viewFieldRepository: Repository<ViewField>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewField[]> {
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
  ): Promise<ViewField[]> {
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

  async findById(id: string, workspaceId: string): Promise<ViewField | null> {
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

  async create(viewFieldData: Partial<ViewField>): Promise<ViewField> {
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

    const viewField = this.viewFieldRepository.create(viewFieldData);

    return this.viewFieldRepository.save(viewField);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewField>,
  ): Promise<ViewField> {
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

  async delete(id: string, workspaceId: string): Promise<ViewField> {
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
