import { FIND_ALL_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-views-graphql-operation.constant';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const METADATA_GRAPHQL_OPERATIONS_TO_CACHE: Record<
  string,
  WorkspaceCacheKeyName[]
> = {
  ObjectMetadataItems: [
    'flatObjectMetadataMaps',
    'flatFieldMetadataMaps',
    'flatIndexMaps',
    'flatSearchFieldMetadataMaps',
    'flatApplicationMaps',
  ],
  [FIND_ALL_VIEWS_GRAPHQL_OPERATION]: [
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
};
