import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type DuplicateEntryDescription = {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadatas: OrmFlatFieldMetadata[];
  duplicateColumn?: { name: string; value: string };
};
