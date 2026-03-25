import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';

export const getApplicationSubAllFlatEntityMaps = ({
  applicationIds,
  fromAllFlatEntityMaps,
}: {
  applicationIds: string[];
  fromAllFlatEntityMaps: AllFlatEntityMaps;
}): AllFlatEntityMaps => {
  const emptyAllFlatEntityMaps = createEmptyAllFlatEntityMaps();

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const fromFlatEntityMaps = fromAllFlatEntityMaps[flatEntityMapsKey];

    const applicationSubFlatEntityMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<
        MetadataFlatEntity<typeof metadataName>
      >({
        applicationIds,
        flatEntityMaps: fromFlatEntityMaps,
      });

    // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
    emptyAllFlatEntityMaps[flatEntityMapsKey] = applicationSubFlatEntityMaps;
  }

  return emptyAllFlatEntityMaps;
};
