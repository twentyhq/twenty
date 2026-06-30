import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Object metadata type enriched with flat fields for tool schema generation
export type ObjectMetadataForToolSchema = FlatObjectMetadata & {
  fields: FlatFieldMetadata[];
};
