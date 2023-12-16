import { ApolloCache, DocumentNode } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

type OptimisticEffectWriter<T> = ({
  cache,
  query,
  newData,
  updatedData,
  variables,
}: {
  cache: ApolloCache<T>;
  query?: DocumentNode;
  newData?: T;
  updatedData?: T;
  deletedRecordIds?: string[];
  variables: ObjectRecordQueryVariables;
  objectMetadataItem?: ObjectMetadataItem;
  isUsingFlexibleBackend?: boolean;
}) => void;

export type OptimisticEffect<T> = {
  key: string;
  query?: DocumentNode;
  typename: string;
  variables: ObjectRecordQueryVariables;
  writer: OptimisticEffectWriter<T>;
  objectMetadataItem?: ObjectMetadataItem;
  isUsingFlexibleBackend?: boolean;
};
