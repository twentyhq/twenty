import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type FromToAllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

export const buildFromToAllUniversalFlatEntityMaps = ({
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
}): FromToAllUniversalFlatEntityMaps => {
  const fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps = {};

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const fromFlatEntityMaps = fromAllFlatEntityMaps[flatEntityMapsKey];
    const toFlatEntityMaps = toAllUniversalFlatEntityMaps[flatEntityMapsKey];

    const fromTo = {
      from: fromFlatEntityMaps,
      to: toFlatEntityMaps,
    };

    // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
    fromToAllFlatEntityMaps[flatEntityMapsKey] = fromTo;
  }

  return fromToAllFlatEntityMaps;
};
