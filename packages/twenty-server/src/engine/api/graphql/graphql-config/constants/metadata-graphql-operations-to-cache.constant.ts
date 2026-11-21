import { type CachedOperationConfig } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';

export const METADATA_GRAPHQL_OPERATIONS_TO_CACHE: Record<
  string,
  CachedOperationConfig
> = {
  ObjectMetadataItems: {
    dependencies: [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatFieldMetadataOptionMaps',
      'flatIndexMaps',
      'flatSearchFieldMetadataMaps',
      'flatApplicationMaps',
      'featureFlagsMap',
    ],
  },
};
