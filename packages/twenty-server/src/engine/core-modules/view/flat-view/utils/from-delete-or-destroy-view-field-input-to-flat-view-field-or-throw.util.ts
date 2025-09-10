import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type DeleteDestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-destroy-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { type FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const fromDeleteOrDestroyViewFieldInputToFlatViewFieldOrThrow = ({
  deleteDestroyViewInput: rawDeleteDestroyViewInput,
  flatViewFieldMaps,
}: {
  deleteDestroyViewInput: DeleteDestroyViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): FlatViewField => {
  const { id: viewFieldId } = extractAndSanitizeObjectStringFields(
    rawDeleteDestroyViewInput,
    ['id'],
  );

  const existingFlatViewFieldToDeleteOrDestroy =
    flatViewFieldMaps.byId[viewFieldId];

  if (!isDefined(existingFlatViewFieldToDeleteOrDestroy)) {
    throw new ViewFieldException(
      t`View field to delete not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  return existingFlatViewFieldToDeleteOrDestroy;
};
