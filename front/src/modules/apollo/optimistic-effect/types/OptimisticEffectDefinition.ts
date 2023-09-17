import { DocumentNode } from 'graphql';

import { OptimisticEffectResolver } from './OptimisticEffectResolver';

export type OptimisticEffectDefinition<T> = {
  key: string;
  query: DocumentNode;
  typename: string;
  resolver: OptimisticEffectResolver<T>;
};
