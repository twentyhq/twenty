import { ALL_FLAT_OBJECT_METADATA_MOCKS } from 'src/codegen/all-flat-object-metadatas.mock';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps.util';

const emptyFlatObjectMetadataMaps: FlatObjectMetadataMaps = {
  byId: {},
  idByNameSingular: {},
};
export const FLAT_OBJECT_METADATA_MAPS_MOCKS: FlatObjectMetadataMaps =
  ALL_FLAT_OBJECT_METADATA_MOCKS.reduce(
    (flatObjectMetadataMaps, flatObjectMetadata) =>
      addFlatObjectMetadataToFlatObjectMetadataMaps({
        flatObjectMetadata,
        flatObjectMetadataMaps,
      }),
    emptyFlatObjectMetadataMaps,
  );