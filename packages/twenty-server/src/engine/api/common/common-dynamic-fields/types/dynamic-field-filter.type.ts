import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type DynamicFieldFilter = {
  flatObjectMetadata: FlatObjectMetadata;
  dynamicFieldName: string;
  dynamicFieldFilter: Record<string, unknown>;
  relationTargetFlatObjectMetadata: FlatObjectMetadata | undefined;
};
