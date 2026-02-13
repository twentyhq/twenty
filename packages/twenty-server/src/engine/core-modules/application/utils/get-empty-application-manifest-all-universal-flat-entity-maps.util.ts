import { APPLICATION_MANIFEST_METADATA_NAMES } from 'src/engine/core-modules/application/constants/application-manifest-metadata-names.constant';
import { type ApplicationManifestAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/utils/compute-application-manifest-all-universal-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

export const getEmptyApplicationManifestAllUniversalFlatEntityMaps =
  (): ApplicationManifestAllUniversalFlatEntityMaps => {
    const result = {} as ApplicationManifestAllUniversalFlatEntityMaps;

    for (const metadataName of APPLICATION_MANIFEST_METADATA_NAMES) {
      const key = getMetadataFlatEntityMapsKey(metadataName);

      result[key] = { byUniversalIdentifier: {} };
    }

    return result;
  };
