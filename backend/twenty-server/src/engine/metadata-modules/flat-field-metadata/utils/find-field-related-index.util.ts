import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findFieldRelatedIndexes = ({
  flatFieldMetadata,
  flatObjectMetadata,
  flatIndexMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
}): FlatIndexMetadata[] => {
  const objectIndexes = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatIndexMaps,
    flatEntityIds: flatObjectMetadata.indexMetadataIds,
  });

  return objectIndexes.filter((index) =>
    index.flatIndexFieldMetadatas.some(
      (indexField) => indexField.fieldMetadataId === flatFieldMetadata.id,
    ),
  );
};
