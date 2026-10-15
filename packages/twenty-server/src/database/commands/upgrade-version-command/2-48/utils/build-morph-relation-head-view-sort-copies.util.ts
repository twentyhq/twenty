import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';

export const buildMorphRelationHeadViewSortCopies = ({
  headByRepresentativeId,
  workspaceCustomApplicationUniversalIdentifier,
  flatViewSortMaps,
}: {
  headByRepresentativeId: Map<string, FlatFieldMetadata>;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatViewSortMaps: FlatEntityMaps<FlatViewSort>;
}): FlatViewSort[] => {
  const viewSorts = Object.values(flatViewSortMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((viewSort) => !isDefined(viewSort.deletedAt));
  const viewSortKeys = new Set(
    viewSorts.map((viewSort) => `${viewSort.viewId}:${viewSort.fieldMetadataId}`),
  );

  return viewSorts.flatMap((viewSort) => {
    const head = headByRepresentativeId.get(viewSort.fieldMetadataId);
    const headKey = `${viewSort.viewId}:${head?.id}`;

    if (!isDefined(head) || viewSortKeys.has(headKey)) {
      return [];
    }

    viewSortKeys.add(headKey);

    return [
      {
        ...viewSort,
        id: v4(),
        universalIdentifier: v4(),
        fieldMetadataId: head.id,
        fieldMetadataUniversalIdentifier: head.universalIdentifier,
        applicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
      },
    ];
  });
};
