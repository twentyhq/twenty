import { type ApolloCache } from '@apollo/client';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';

// Common context passed to all optimistic effects
export type OptimisticEffectContext = {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  upsertRecordsInStore: (records: ObjectRecord[]) => void;
};

// Edge creation parameters
export type CreateEdgeParams = {
  record: RecordGqlNode;
  objectMetadataItem: ObjectMetadataItem;
  toReference: (record: RecordGqlNode) => any;
};

