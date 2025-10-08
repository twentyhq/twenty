import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type UpdateViewFieldInput } from 'src/engine/core-modules/view-field/dtos/inputs/update-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/core-modules/view-field/exceptions/view-field.exception';
import { FLAT_VIEW_FIELD_EDITABLE_PROPERTIES } from 'src/engine/core-modules/view-field/flat-view-field/constants/flat-view-field-editable-properties.constant';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view-field/flat-view-field/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view-field/flat-view-field/types/flat-view-field.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow = ({
  updateViewFieldInput: rawUpdateViewFieldInput,
  flatViewFieldMaps,
}: {
  updateViewFieldInput: UpdateViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): FlatViewField => {
  const { id: viewFieldToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewFieldInput,
      ['id'],
    );

  const existingFlatViewFieldToUpdate =
    flatViewFieldMaps.byId[viewFieldToUpdateId];

  if (!isDefined(existingFlatViewFieldToUpdate)) {
    throw new ViewFieldException(
      t`View field to update not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }
  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewFieldInput.update,
    FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewFieldToUpdate,
    properties: FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });
};
