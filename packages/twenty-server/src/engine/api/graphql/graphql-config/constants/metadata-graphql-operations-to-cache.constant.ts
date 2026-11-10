import { METADATA_RESPONSE_CACHE_APPROVED_REQUESTS } from 'twenty-shared/metadata';

import { type CachedOperationConfig } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { FIND_ALL_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-views-graphql-operation.constant';
import { VIEW_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/view/constants/view-read-access-policy.constant';
import { OBJECT_METADATA_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-read-access-policy.constant';

export const METADATA_GRAPHQL_OPERATIONS_TO_CACHE: Record<
  string,
  CachedOperationConfig
> = {
  ObjectMetadataItems: {
    scope: 'workspace',
    accessPolicy: OBJECT_METADATA_READ_ACCESS_POLICY,
    isAllowedWhenWorkspaceSuspended: true,
    approvedRequests:
      METADATA_RESPONSE_CACHE_APPROVED_REQUESTS.ObjectMetadataItems,
    admissionDependencies: [],
    dependencies: [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatSearchFieldMetadataMaps',
      'flatApplicationMaps',
      'featureFlagsMap',
    ],
  },
  [FIND_ALL_VIEWS_GRAPHQL_OPERATION]: {
    scope: 'userWorkspace',
    accessPolicy: VIEW_READ_ACCESS_POLICY,
    isAllowedWhenWorkspaceSuspended: true,
    approvedRequests:
      METADATA_RESPONSE_CACHE_APPROVED_REQUESTS[
        FIND_ALL_VIEWS_GRAPHQL_OPERATION
      ],
    admissionDependencies: ['flatRoleTargetMaps', 'flatWorkspaceMemberMaps'],
    dependencies: [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatViewFilterMaps',
      'flatViewFilterGroupMaps',
      'flatViewSortMaps',
      'flatViewGroupMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatApplicationMaps',
    ],
  },
};
