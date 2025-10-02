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
    if (this.hasRequiredFields(viewFieldData)) {
      try {
        if (isDefined(viewFieldData.position)) {
          const viewFieldDataWithPosition =
            viewFieldData as typeof viewFieldData & { position: number };

          await this.verifyLabelMetadataIdentifierIsInFirstPositionOrThrow(
            viewFieldDataWithPosition,
            viewFieldData.workspaceId,
          );
        }

        await this.verifyLabelMetadataIdentifierIsVisibleOrThrow(
          viewFieldData,
          viewFieldData.workspaceId,
        );

        const viewFieldDataWithPosition = await this.formatViewFieldData(
          viewFieldData,
          viewFieldData.workspaceId,
        );

        const viewField = this.viewFieldRepository.create(
          viewFieldDataWithPosition,
        );

        const savedViewField = await this.viewFieldRepository.save(viewField);

        await this.viewService.flushGraphQLCache(viewFieldData.workspaceId);

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
              userFriendlyMessage:
                generateViewFieldUserFriendlyExceptionMessage(
                  ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
                ),
            },
          );
        }

        return createdViewField;
      } catch (error) {
        if (
          error.message.includes(
            'duplicate key value violates unique constraint',
          )
        ) {
          throw new ViewFieldException(
            generateViewFieldExceptionMessage(
              ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS,
            ),
            ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
            {
              userFriendlyMessage:
                generateViewFieldUserFriendlyExceptionMessage(
                  ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS,
                ),
            },
          );
        }

        throw error;
      }
    } else {
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
    const viewId = existingViewField.viewId;

    if (this.updatesPosition(updateData)) {
      await this.verifyLabelMetadataIdentifierIsInFirstPositionOrThrow(
        {
          ...updateData,
          viewId,
          id,
          fieldMetadataId: existingViewField.fieldMetadataId,
        },
        workspaceId,
      );
    }

    if (this.disablesVisibility(updateData)) {
      await this.verifyLabelMetadataIdentifierIsVisibleOrThrow(
        { ...updateData, viewId, id },
        workspaceId,
      );
    }

    const updatedViewField = await this.viewFieldRepository.save({
      id,
      ...updateData,
    });

    await this.viewService.flushGraphQLCache(workspaceId);

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

    await this.viewService.flushGraphQLCache(workspaceId);

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

    await this.viewService.flushGraphQLCache(workspaceId);

    return viewField;
  }

  private updatesPosition(
    data: Partial<ViewFieldEntity>,
  ): data is Partial<ViewFieldEntity> & { position: number } {
    return isDefined(data.position);
  }

  private disablesVisibility(
    data: Partial<ViewFieldEntity>,
  ): data is Partial<ViewFieldEntity> & { isVisible: boolean } {
    return data.isVisible === false;
  }

  private async verifyLabelMetadataIdentifierIsVisibleOrThrow(
    newOrUpdatedViewField: Partial<ViewFieldEntity> & {
      viewId: string;
    },
    workspaceId: string,
  ) {
    const view = await this.viewService.findByIdWithRelatedObjectMetadata(
      newOrUpdatedViewField.viewId,
      workspaceId,
    );

    if (!isDefined(view)) {
      throw new Error(`View not found: ${newOrUpdatedViewField.viewId}`);
    }

    const labelMetadataIdentifierFieldMetadataId =
      view.objectMetadata.labelIdentifierFieldMetadataId;

    const labelMetadataIdentifierViewField = view.viewFields.find(
      (viewField) =>
        viewField.fieldMetadataId === labelMetadataIdentifierFieldMetadataId,
    );

    if (
      !isDefined(labelMetadataIdentifierViewField) ||
      labelMetadataIdentifierViewField.id !== newOrUpdatedViewField.id
    ) {
      return;
    }

    if (newOrUpdatedViewField.isVisible === false) {
      throw new UserInputError('Label metadata identifier must stay visible.', {
        userFriendlyMessage: 'Record text must stay visible.',
      });
    }
  }

  private async verifyLabelMetadataIdentifierIsInFirstPositionOrThrow(
    newOrUpdatedViewField: Partial<ViewFieldEntity> & { viewId: string } & {
      position: number;
    },
    workspaceId: string,
  ) {
    const view = await this.viewService.findByIdWithRelatedObjectMetadata(
      newOrUpdatedViewField.viewId,
      workspaceId,
    );

    if (!isDefined(view)) {
      throw new Error(`View not found: ${newOrUpdatedViewField.viewId}`);
    }

    const viewFieldsWithoutUpdatedViewField = view.viewFields.filter(
      (viewField) => viewField.id !== newOrUpdatedViewField?.id,
    );

    if (viewFieldsWithoutUpdatedViewField.length === 0) {
      return;
    }

    const labelMetadataIdentifierFieldMetadataId =
      view.objectMetadata.labelIdentifierFieldMetadataId;

    if (
      labelMetadataIdentifierFieldMetadataId ===
      newOrUpdatedViewField.fieldMetadataId
    ) {
      const minPositionInViewWithoutUpdatedViewField =
        viewFieldsWithoutUpdatedViewField.reduce(
          (minViewField, viewField) =>
            viewField.position < minViewField.position
              ? viewField
              : minViewField,
          viewFieldsWithoutUpdatedViewField[0],
        ).position;

      if (
        newOrUpdatedViewField.position >=
        minPositionInViewWithoutUpdatedViewField
      ) {
        throw new UserInputError(
          'Label metadata identifier must keep the minimal position in the view.',
          {
            userFriendlyMessage:
              'Record text must be in first position of the view.',
          },
        );
      }
    } else {
      const labelMetadataIdentifierViewFieldPosition = view.viewFields.find(
        (viewField) =>
          viewField.fieldMetadataId === labelMetadataIdentifierFieldMetadataId,
      )?.position;

      if (
        isDefined(labelMetadataIdentifierViewFieldPosition) &&
        newOrUpdatedViewField.position <=
          labelMetadataIdentifierViewFieldPosition
      ) {
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

  private async formatViewFieldData(
    viewFieldData: Partial<ViewFieldEntity> & { viewId: string },
    workspaceId: string,
  ): Promise<Partial<ViewFieldEntity>> {
    if (!isDefined(viewFieldData.position)) {
      const view = await this.viewService.findByIdWithRelatedObjectMetadata(
        viewFieldData.viewId,
        workspaceId,
      );

      if (!isDefined(view)) {
        throw new Error(`View not found: ${viewFieldData.viewId}`);
      }

      const highestPositionInView = view.viewFields.reduce(
        (maxViewField, viewField) =>
          viewField.position > maxViewField.position ? viewField : maxViewField,
        view.viewFields[0],
      );

      return { ...viewFieldData, position: highestPositionInView.position + 1 };
    } else {
      return viewFieldData;
    }
  }

  private hasRequiredFields(
    data: Partial<ViewFieldEntity>,
  ): data is Partial<ViewFieldEntity> & {
    viewId: string;
    fieldMetadataId: string;
    workspaceId: string;
  } {
    return (
      isDefined(data.viewId) &&
      isDefined(data.fieldMetadataId) &&
      isDefined(data.workspaceId)
    );
  }
}
