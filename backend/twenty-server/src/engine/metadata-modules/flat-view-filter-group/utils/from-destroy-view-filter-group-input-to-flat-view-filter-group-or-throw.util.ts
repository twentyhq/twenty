import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DestroyViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/destroy-view-filter-group.input';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { type UniversalFlatViewFilterGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter-group.type';

export const fromDestroyViewFilterGroupInputToFlatViewFilterGroupOrThrow = ({
  destroyViewFilterGroupInput,
  flatViewFilterGroupMaps,
}: {
  destroyViewFilterGroupInput: DestroyViewFilterGroupInput;
  flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
}): UniversalFlatViewFilterGroup => {
  const { id: viewFilterGroupId } = extractAndSanitizeObjectStringFields(
    destroyViewFilterGroupInput,
    ['id'],
  );

  const existingFlatViewFilterGroupToDestroy =
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: viewFilterGroupId,
      flatEntityMaps: flatViewFilterGroupMaps,
    });

  if (!isDefined(existingFlatViewFilterGroupToDestroy)) {
    throw new ViewFilterGroupException(
      'View filter group not found',
      ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
    );
  }

  return existingFlatViewFilterGroupToDestroy;
};
