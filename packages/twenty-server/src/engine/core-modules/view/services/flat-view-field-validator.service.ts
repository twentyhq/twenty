import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';
import { FailedFlatViewFieldValidation } from 'src/engine/core-modules/view/types/failed-flat-view-field-validation.type';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view/types/flat-view-field.type';
import { FlatViewMaps } from 'src/engine/core-modules/view/types/flat-view-maps.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

@Injectable()
export class FlatViewFieldValidatorService {
  constructor() {}

  public validateFlatViewFieldUpdate({
    _existingFlatViewFieldMaps,
    updatedFlatViewField,
  }: {
    _existingFlatViewFieldMaps: FlatViewFieldMaps;
    updatedFlatViewField: FlatViewField;
  }): FailedFlatViewFieldValidation {
    return {
      type: 'update_view_field',
      viewFieldLevelErrors: [],
      failedViewFieldValidationMinimalInformation: {
        viewFieldId: updatedFlatViewField.id,
        viewId: updatedFlatViewField.viewId,
        fieldMetadataId: updatedFlatViewField.fieldMetadataId,
      },
    };
  }

  public validateFlatViewFieldDeletion({
    _existingFlatViewFieldMaps,
    viewFieldIdToDelete,
  }: {
    _existingFlatViewFieldMaps: FlatViewFieldMaps;
    viewFieldIdToDelete: string;
  }): FailedFlatViewFieldValidation {
    return {
      type: 'delete_view_field',
      viewFieldLevelErrors: [],
      failedViewFieldValidationMinimalInformation: {
        viewFieldId: viewFieldIdToDelete,
      },
    };
  }

  public async validateFlatViewFieldCreation({
    _existingFlatViewFieldMaps,
    flatViewFieldToValidate,
    _otherFlatViewFieldMapsToValidate,
    optimisticFlatObjectMetadataMaps,
    optimisticFlatViewMaps,
  }: {
    _existingFlatViewFieldMaps: FlatViewFieldMaps;
    flatViewFieldToValidate: FlatViewField;
    _otherFlatViewFieldMapsToValidate?: FlatViewFieldMaps;
    optimisticFlatObjectMetadataMaps?: FlatObjectMetadataMaps;
    optimisticFlatViewMaps?: FlatViewMaps;
  }): Promise<FailedFlatViewFieldValidation> {
    const errors = [];

    // TODO: replace once we have a dedicated field maps
    if (isDefined(optimisticFlatObjectMetadataMaps)) {
      let fieldMetadataFound = false;

      for (const objectMetadata of Object.values(
        optimisticFlatObjectMetadataMaps.byId,
      )) {
        if (
          isDefined(objectMetadata) &&
          objectMetadata.flatFieldMetadatas.some(
            (field) => field.id === flatViewFieldToValidate.fieldMetadataId,
          )
        ) {
          fieldMetadataFound = true;
          break;
        }
      }

      if (!fieldMetadataFound) {
        errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Field metadata not found`,
          userFriendlyMessage: t`Field metadata not found`,
        });
      }
    }

    // Validate that the viewId exists in views
    if (isDefined(optimisticFlatViewMaps)) {
      const optimisticFlatView =
        optimisticFlatViewMaps.byId[flatViewFieldToValidate.viewId];

      if (!isDefined(optimisticFlatView)) {
        errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`View not found`,
          userFriendlyMessage: t`View not found`,
        });
      }
    }

    return {
      type: 'create_view_field',
      viewFieldLevelErrors: errors,
      failedViewFieldValidationMinimalInformation: {
        viewFieldId: flatViewFieldToValidate.id,
        viewId: flatViewFieldToValidate.viewId,
        fieldMetadataId: flatViewFieldToValidate.fieldMetadataId,
      },
    };
  }
}
