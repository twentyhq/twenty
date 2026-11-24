import { type Enhancer } from '@nestjs/graphql';

// Field resolvers get the guards and exception filters of root operations
export const GRAPHQL_FIELD_RESOLVER_ENHANCERS: Enhancer[] = [
  'guards',
  'filters',
];
