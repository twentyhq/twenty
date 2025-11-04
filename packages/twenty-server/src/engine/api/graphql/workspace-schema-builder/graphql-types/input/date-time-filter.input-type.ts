import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const DateTimeFilterType = new GraphQLInputObjectType({
  name: 'DateTimeFilter',
  fields: {
    eq: { type: GraphQLISODateTime },
    gt: { type: GraphQLISODateTime },
    gte: { type: GraphQLISODateTime },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLISODateTime)) },
    lt: { type: GraphQLISODateTime },
    lte: { type: GraphQLISODateTime },
    neq: { type: GraphQLISODateTime },
    is: { type: FilterIs },
  },
});
