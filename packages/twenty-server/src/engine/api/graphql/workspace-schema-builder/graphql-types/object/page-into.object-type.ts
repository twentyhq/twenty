import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ConnectionCursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    startCursor: { type: ConnectionCursorScalarType },
    endCursor: { type: ConnectionCursorScalarType },
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});
