import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const TSVectorFilterType = new GraphQLInputObjectType({
  name: 'TSVectorFilter',
  fields: {
    contains: { type: GraphQLString },
  },
});
