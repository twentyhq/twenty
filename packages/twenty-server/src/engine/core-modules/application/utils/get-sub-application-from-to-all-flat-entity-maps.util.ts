import { type FromTo } from 'twenty-shared/types';

import { APPLICATION_MANIFEST_METADATA_NAMES } from 'src/engine/core-modules/application/constants/application-manifest-metadata-names.constant';
import {
  type ApplicationManifestAllFlatEntityMaps,
  type ApplicationManifestAllUniversalFlatEntityMaps,
} from 'src/engine/core-modules/application/utils/compute-application-manifest-all-universal-flat-entity-maps.util';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

export type FromToApplicationManifestAllUniversalFlatEntityMaps = {
  [P in keyof ApplicationManifestAllFlatEntityMaps]?: FromTo<
    AllUniversalFlatEntityMaps[P]
  >;
};

export const getSubApplicationFromToAllFlatEntityMaps = ({
  applicationId,
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  applicationId: string;
  fromAllFlatEntityMaps: ApplicationManifestAllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: ApplicationManifestAllUniversalFlatEntityMaps;
}): FromToApplicationManifestAllUniversalFlatEntityMaps => {
  const fromToAllFlatEntityMaps: FromToApplicationManifestAllUniversalFlatEntityMaps =
    {};

  for (const metadataName of APPLICATION_MANIFEST_METADATA_NAMES) {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const fromFlatEntityMaps = fromAllFlatEntityMaps[flatEntityMapsKey];
    const toFlatEntityMaps = toAllUniversalFlatEntityMaps[flatEntityMapsKey];

    const fromTo = {
      from: getSubFlatEntityMapsByApplicationIdsOrThrow<
        MetadataFlatEntity<typeof metadataName>
      >({
        applicationIds: [applicationId],
        flatEntityMaps: fromFlatEntityMaps,
      }),
      to: toFlatEntityMaps,
    };

    // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
    fromToAllFlatEntityMaps[flatEntityMapsKey] = fromTo;
  }

  return fromToAllFlatEntityMaps;
};
