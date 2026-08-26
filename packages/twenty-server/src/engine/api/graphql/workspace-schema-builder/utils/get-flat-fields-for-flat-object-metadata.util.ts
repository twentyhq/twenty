import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Generic over the field shape so it preserves whatever the caller holds: the record query path
// passes a lite map and gets lite fields, the metadata layer passes the full map and gets full
// fields. The body only reads ids, so the lite lower bound is enough.
export const getFlatFieldsFromFlatObjectMetadata = <
  T extends LiteFlatFieldMetadata = FlatFieldMetadata,
>(
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<T>,
): T[] => {
  return findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  });
};
