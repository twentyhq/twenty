import { type CachedOperationConfig } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { FIND_ALL_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-views-graphql-operation.constant';

export const METADATA_GRAPHQL_OPERATIONS_TO_CACHE: Record<
  string,
  CachedOperationConfig
> = {
  ObjectMetadataItems: {
    scope: 'workspace',
    dependencies: [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatSearchFieldMetadataMaps',
      'flatApplicationMaps',
    ],
  },
  [FIND_ALL_VIEWS_GRAPHQL_OPERATION]: {
    scope: 'userWorkspace',
    dependencies: [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatViewFilterMaps',
      'flatViewFilterGroupMaps',
      'flatViewSortMaps',
      'flatViewGroupMaps',
      'flatObjectMetadataMaps',
      'flatApplicationMaps',
    ],
  },
};
