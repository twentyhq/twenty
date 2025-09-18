import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
  generateViewFieldExceptionMessage,
  generateViewFieldUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';

@Injectable()
export class ViewFieldService {
  constructor(
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    private readonly viewService: ViewService,
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

      const savedViewField = await this.viewFieldRepository.save(viewField);
      const createdViewField = await this.findById(
        savedViewField.id,
        viewFieldData.workspaceId,
      );

      if (!isDefined(createdViewField)) {
        throw new ViewFieldException(
          generateViewFieldExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          ),
          ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
          {
            userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
              ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
            ),
          },
        );
      }

      return createdViewField;
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

    if (this.updatesPosition(updateData)) {
      await this.verifyLabelMetadataIdentifierIsStillInFirstPositionOrThrow(
        existingViewField,
        workspaceId,
        updateData,
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

  async destroy(id: string, workspaceId: string): Promise<ViewFieldEntity> {
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

    return viewField;
  }

  private async verifyLabelMetadataIdentifierIsStillInFirstPositionOrThrow(
    viewField: ViewFieldEntity,
    workspaceId: string,
    newViewField: Partial<ViewFieldEntity> & { position: number },
  ) {
    const view = await this.viewService.findByIdWithRelatedObjectMetadata(
      viewField.viewId,
      workspaceId,
    );

    if (!isDefined(view)) {
      throw new Error(`View not found: ${viewField.viewId}`);
    }

    const labelMetadataIdentifierFieldMetadataId =
      view.objectMetadata.labelIdentifierFieldMetadataId;

    const viewFieldsWithUpdatedPosition = view.viewFields.map((field) =>
      field.id === viewField.id
        ? { ...field, position: newViewField.position }
        : field,
    );

    const fieldMetadataIdWithMinPositionInViewAfterUpdate =
      viewFieldsWithUpdatedPosition.reduce(
        (minField, field) =>
          field.position < minField.position ? field : minField,
        viewFieldsWithUpdatedPosition[0],
      );

    if (labelMetadataIdentifierFieldMetadataId === viewField.id) {
      if (fieldMetadataIdWithMinPositionInViewAfterUpdate.id !== viewField.id) {
        throw new UserInputError(
          'Label metadata identifier must keep the minimal position in the view.',
          {
            userFriendlyMessage:
              'Record text must be in first position of the view.',
          },
        );
      }
    } else {
      if (fieldMetadataIdWithMinPositionInViewAfterUpdate.id === viewField.id) {
        throw new UserInputError(
          'Label metadata identifier must keep the minimal position in the view.',
          {
            userFriendlyMessage:
              'Record text must be in first position of the view.',
          },
        );
      }
    }
  }

  private updatesPosition(
    data: Partial<ViewFieldEntity>,
  ): data is Partial<ViewFieldEntity> & { position: number } {
    return isDefined(data.position);
  }
}
