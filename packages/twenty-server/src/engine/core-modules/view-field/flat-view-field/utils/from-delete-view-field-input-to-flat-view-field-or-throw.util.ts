import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type DeleteViewFieldInput } from 'src/engine/core-modules/view-field/dtos/inputs/delete-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/core-modules/view-field/exceptions/view-field.exception';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view-field/flat-view-field/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view-field/flat-view-field/types/flat-view-field.type';

export const fromDeleteViewFieldInputToFlatViewFieldOrThrow = ({
  deleteViewFieldInput: rawDeleteViewFieldInput,
  flatViewFieldMaps,
}: {
  deleteViewFieldInput: DeleteViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): FlatViewField => {
  const { id: viewFieldId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFieldInput,
    ['id'],
  );

  const existingFlatViewFieldToDelete = flatViewFieldMaps.byId[viewFieldId];

  if (!isDefined(existingFlatViewFieldToDelete)) {
    throw new ViewFieldException(
      t`View field to delete not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewFieldToDelete,
    deletedAt: new Date(),
  };
};
