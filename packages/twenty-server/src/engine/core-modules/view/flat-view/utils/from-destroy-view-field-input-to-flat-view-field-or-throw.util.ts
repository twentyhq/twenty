import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { type FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const fromDestroyViewFieldInputToFlatViewFieldOrThrow = ({
  destroyViewFieldInput: rawDeleteDestroyViewInput,
  flatViewFieldMaps,
}: {
  destroyViewFieldInput: DestroyViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): FlatViewField => {
  const { id: viewFieldId } = extractAndSanitizeObjectStringFields(
    rawDeleteDestroyViewInput,
    ['id'],
  );

  const existingFlatViewFieldToDestroy = flatViewFieldMaps.byId[viewFieldId];

  if (!isDefined(existingFlatViewFieldToDestroy)) {
    throw new ViewFieldException(
      t`View field to destroy not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  return existingFlatViewFieldToDestroy;
};
