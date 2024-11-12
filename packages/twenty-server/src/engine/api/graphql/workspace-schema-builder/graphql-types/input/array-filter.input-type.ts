import { GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const ArrayFilterType = new GraphQLInputObjectType({
  name: 'ArrayFilter',
  fields: {
    containsIlike: { type: new GraphQLList(GraphQLString) },
    contains: { type: new GraphQLList(GraphQLString) },
    not_contains: { type: new GraphQLList(GraphQLString) },
    is: { type: FilterIs },
  },
});
