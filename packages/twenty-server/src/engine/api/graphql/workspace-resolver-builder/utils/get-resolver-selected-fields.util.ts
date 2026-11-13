import { type GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

// Keeps field arguments, which nested one-to-many filter/orderBy/first rely on
export const getResolverSelectedFields = (info: GraphQLResolveInfo) =>
  graphqlFields(info, {}, { processArguments: true });
