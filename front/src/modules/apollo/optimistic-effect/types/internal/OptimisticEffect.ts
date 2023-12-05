import { ApolloCache, DocumentNode, OperationVariables } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type OptimisticEffectWriter<T> = ({
  cache,
  newData,
  variables,
  query,
}: {
  cache: ApolloCache<T>;
  query: DocumentNode;
  newData: T;
  deletedRecordIds?: string[];
  variables: OperationVariables;
  objectMetadataItem?: ObjectMetadataItem;
  isUsingFlexibleBackend?: boolean;
}) => void;

export type OptimisticEffect<T> = {
  key: string;
  query?: DocumentNode;
  typename: string;
  variables: OperationVariables;
  writer: OptimisticEffectWriter<T>;
  objectMetadataItem?: ObjectMetadataItem;
  isUsingFlexibleBackend?: boolean;
};
