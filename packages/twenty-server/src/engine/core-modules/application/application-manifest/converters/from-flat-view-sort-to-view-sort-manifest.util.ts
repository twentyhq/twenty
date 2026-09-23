import { type ViewSortManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';

export const fromFlatViewSortToViewSortManifest = ({
  flatViewSort,
}: {
  flatViewSort: UniversalFlatViewSort;
}): ViewSortManifest => ({
  universalIdentifier: flatViewSort.universalIdentifier,
  fieldMetadataUniversalIdentifier:
    flatViewSort.fieldMetadataUniversalIdentifier,
  direction: flatViewSort.direction,
  ...(isDefined(flatViewSort.subFieldName)
    ? { subFieldName: flatViewSort.subFieldName }
    : {}),
});
