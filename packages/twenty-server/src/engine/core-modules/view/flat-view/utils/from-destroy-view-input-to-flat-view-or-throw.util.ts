import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type DestroyViewInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view.input';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/core-modules/view/exceptions/view.exception';
import { type FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export const fromDestroyViewInputToFlatViewOrThrow = ({
  destroyViewInput: rawDestroyViewInput,
  flatViewMaps,
}: {
  destroyViewInput: DestroyViewInput;
  flatViewMaps: FlatViewMaps;
}): FlatView => {
  const { id: viewId } = extractAndSanitizeObjectStringFields(
    rawDestroyViewInput,
    ['id'],
  );

  const existingFlatViewToDestroy = flatViewMaps.byId[viewId];

  if (!isDefined(existingFlatViewToDestroy)) {
    throw new ViewException(
      t`View to destroy not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  return existingFlatViewToDestroy;
};
