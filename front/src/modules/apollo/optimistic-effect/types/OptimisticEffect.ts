import { ApolloCache } from '@apollo/client';

type OptimisticEffectResolver<T, QueryVariables> = ({
  cache,
  entities,
  variables,
}: {
  cache: ApolloCache<T>;
  entities: T[];
  variables: QueryVariables;
}) => void;

export type OptimisticEffect<T, QueryVariables> = {
  key: string;
  typename: string;
  variables: QueryVariables;
  resolver: OptimisticEffectResolver<T, QueryVariables>;
};
