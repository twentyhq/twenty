import { GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';

export const ArrayFilterType = new GraphQLInputObjectType({
  name: 'ArrayFilter',
  fields: {
    contains: { type: new GraphQLList(GraphQLString) },
    contains_any: { type: new GraphQLList(GraphQLString) },
    not_contains: { type: new GraphQLList(GraphQLString) },
  },
});
