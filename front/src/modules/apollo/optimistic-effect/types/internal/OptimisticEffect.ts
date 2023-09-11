import { ApolloCache, DocumentNode, OperationVariables } from '@apollo/client';

type OptimisticEffectWriter<T> = ({
  cache,
  newData,
  variables,
  query,
}: {
  cache: ApolloCache<T>;
  query: DocumentNode;
  newData: T[];
  variables: OperationVariables;
}) => void;

export type OptimisticEffect<T> = {
  key: string;
  query: DocumentNode;
  typename: string;
  variables: OperationVariables;
  writer: OptimisticEffectWriter<T>;
};
