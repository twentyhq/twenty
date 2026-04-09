import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { FLAT_VIEW_SORT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-sort/constants/flat-view-sort-editable-properties.constant';
import { type UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import {
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';
import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';
import { type FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export const fromUpdateViewSortInputToFlatViewSortToUpdateOrThrow = ({
  updateViewSortInput: rawUpdateViewSortInput,
  flatViewSortMaps,
}: {
  updateViewSortInput: UpdateViewSortInput;
  flatViewSortMaps: FlatViewSortMaps;
}): UniversalFlatViewSort => {
  const { id: viewSortToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewSortInput,
      ['id'],
    );

  const existingFlatViewSortToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewSortToUpdateId,
    flatEntityMaps: flatViewSortMaps,
  });

  if (!isDefined(existingFlatViewSortToUpdate)) {
    throw new ViewSortException(
      t`View sort not found`,
      ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
    );
  }

  const updatedEditableSortProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewSortInput.update,
    FLAT_VIEW_SORT_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewSortToUpdate,
    properties: FLAT_VIEW_SORT_EDITABLE_PROPERTIES,
    update: updatedEditableSortProperties,
  });
};
