import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

// The searchVector GIN index is the single-column GIN index whose only field is
// the object's TS_VECTOR searchVector field (see build-search-vector-gin-index-for-custom-object.util).
export const isSearchVectorGinFlatIndexMetadata = ({
  flatIndexMetadata,
  flatFieldMetadataMaps,
}: {
  flatIndexMetadata: FlatIndexMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): boolean => {
  if (flatIndexMetadata.indexType !== IndexType.GIN) {
    return false;
  }

  if (flatIndexMetadata.flatIndexFieldMetadatas.length !== 1) {
    return false;
  }

  const indexedFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: flatIndexMetadata.flatIndexFieldMetadatas[0].fieldMetadataId,
  });

  return (
    isDefined(indexedFlatFieldMetadata) &&
    indexedFlatFieldMetadata.type === FieldMetadataType.TS_VECTOR &&
    indexedFlatFieldMetadata.name === SEARCH_VECTOR_FIELD.name
  );
};
