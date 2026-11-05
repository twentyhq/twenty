import { getUniqueConstraintsFields } from 'twenty-shared/utils';

import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getObjectMetadataUniqueConstraints = ({
  flatObjectMetadata,
  fields,
  flatIndexMaps,
}: Pick<SchemaGenerationContext, 'flatIndexMaps'> & {
  flatObjectMetadata: FlatObjectMetadata;
  fields: FlatFieldMetadata[];
}): FlatFieldMetadata[][] => {
  const indexMetadatas = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.indexMetadataIds,
    flatEntityMaps: flatIndexMaps,
  }).map((flatIndex) => ({
    id: flatIndex.id,
    isUnique: flatIndex.isUnique,
    indexFieldMetadatas: flatIndex.flatIndexFieldMetadatas,
  }));
  const objectWithIndexes = {
    id: flatObjectMetadata.id,
    indexMetadatas,
    fields,
  };

  return getUniqueConstraintsFields<
    FlatFieldMetadata,
    typeof objectWithIndexes
  >(objectWithIndexes);
};
