import { ApolloCache, DocumentNode } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export type OptimisticEffectWriter = ({
  cache,
  query,
  createdRecords,
  updatedRecords,
  deletedRecordIds,
  variables,
  objectMetadataItem,
}: {
  cache: ApolloCache<any>;
  query?: DocumentNode;
  createdRecords?: Record<string, unknown>[];
  updatedRecords?: Record<string, unknown>[];
  deletedRecordIds?: string[];
  variables: ObjectRecordQueryVariables;
  objectMetadataItem: ObjectMetadataItem;
}) => void;

export type OptimisticEffect = {
  query?: DocumentNode;
  typename: string;
  variables: ObjectRecordQueryVariables;
  writer: OptimisticEffectWriter;
  objectMetadataItem: ObjectMetadataItem;
};
