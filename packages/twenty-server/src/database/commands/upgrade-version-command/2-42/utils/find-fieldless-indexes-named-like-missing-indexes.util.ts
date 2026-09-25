import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type MissingSystemRelationIndex } from 'src/database/commands/upgrade-version-command/2-42/utils/build-missing-system-relation-indexes.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export const findFieldlessIndexesNamedLikeMissingIndexes = ({
  flatIndexMaps,
  missingIndexes,
}: Pick<AllFlatEntityMaps, 'flatIndexMaps'> & {
  missingIndexes: MissingSystemRelationIndex[];
}): FlatIndexMetadata[] => {
  const missingIndexNames = new Set(
    missingIndexes.map(({ universalFlatIndexMetadata }) =>
      universalFlatIndexMetadata.name.toLocaleUpperCase(),
    ),
  );

  return Object.values(flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatIndex) =>
        !isNonEmptyArray(flatIndex.flatIndexFieldMetadatas) &&
        missingIndexNames.has(flatIndex.name.toLocaleUpperCase()),
    );
};
