import { t } from '@lingui/core/macro';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE } from 'src/engine/core-modules/view/flat-view/constants/flat-view-field-properties-to-compare.constant';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-optional-record-in-record.util';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

export const fromUpdateViewFieldInputToFlatViewFieldToOrThrow = ({
  updateViewFieldInput: rawUpdateViewFieldInput,
  flatViewMaps,
}: {
  updateViewFieldInput: UpdateViewFieldInput;
  flatViewMaps: FlatViewFieldMaps;
}): FlatViewField => {
  const { id: viewFieldToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewFieldInput,
      ['id'],
    );

  const existingFlatViewFieldToUpdate = flatViewMaps.byId[viewFieldToUpdateId];

  if (!isDefined(existingFlatViewFieldToUpdate)) {
    throw new ViewFieldException(
      t`View field to update not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }
  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewFieldInput,
    FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewFieldToUpdate,
    properties: FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE,
    update: updatedEditableFieldProperties,
  });
};
