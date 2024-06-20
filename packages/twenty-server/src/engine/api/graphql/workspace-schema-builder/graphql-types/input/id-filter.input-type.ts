import { GraphQLID, GraphQLInputObjectType, GraphQLList } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const IDFilterType = new GraphQLInputObjectType({
  name: 'IDFilter',
  fields: {
    eq: { type: GraphQLID },
    gt: { type: GraphQLID },
    gte: { type: GraphQLID },
    in: { type: new GraphQLList(GraphQLID) },
    lt: { type: GraphQLID },
    lte: { type: GraphQLID },
    neq: { type: GraphQLID },
    is: { type: FilterIs },
  },
});
