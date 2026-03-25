import { ConnectionCursorScalar } from '@ptc-org/nestjs-query-graphql';
import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType } from 'graphql';

/**
 * GraphQL PageInfo type.
 */
export const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    startCursor: { type: ConnectionCursorScalar },
    endCursor: { type: ConnectionCursorScalar },
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});
