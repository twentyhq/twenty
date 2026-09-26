import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

// An index whose fields were all deleted keeps its metadata row, and that name
// blocks any new index with the same deterministic name. Names still used by an
// index that has fields are skipped, so the live index keeps its metadata.
export const findFieldLessFlatIndexes = ({
  flatIndexMaps,
}: {
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
}): FlatIndexMetadata[] => {
  const flatIndexes = Object.values(flatIndexMaps.byUniversalIdentifier).filter(
    isDefined,
  );

  const namesOfIndexesWithFields = new Set(
    flatIndexes
      .filter((flatIndex) => flatIndex.flatIndexFieldMetadatas.length > 0)
      .map((flatIndex) => flatIndex.name),
  );

  return flatIndexes.filter(
    (flatIndex) =>
      flatIndex.flatIndexFieldMetadatas.length === 0 &&
      !namesOfIndexesWithFields.has(flatIndex.name),
  );
};
