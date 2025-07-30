import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
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
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewField | null> {
    const viewField = await this.viewFieldRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return viewField || null;
  }

  async create(viewFieldData: Partial<ViewField>): Promise<ViewField> {
    if (!isDefined(viewFieldData.workspaceId)) {
      throw new ViewFieldException(
        'WorkspaceId is required',
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        {
          userFriendlyMessage:
            'WorkspaceId is required to create a view field.',
        },
      );
    }

    if (!isDefined(viewFieldData.viewId)) {
      throw new ViewFieldException(
        'ViewId is required',
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        { userFriendlyMessage: 'ViewId is required to create a view field.' },
      );
    }

    if (!isDefined(viewFieldData.fieldMetadataId)) {
      throw new ViewFieldException(
        'FieldMetadataId is required',
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        {
          userFriendlyMessage:
            'FieldMetadataId is required to create a view field.',
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
        `ViewField with id ${id} not found`,
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
        `ViewField with id ${id} not found`,
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
      );
    }

    await this.viewFieldRepository.softDelete(id);

    return viewField;
  }
}
