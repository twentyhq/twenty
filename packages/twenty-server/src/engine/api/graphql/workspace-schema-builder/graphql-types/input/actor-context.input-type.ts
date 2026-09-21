import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const ActorContextInputType = new GraphQLInputObjectType({
  name: 'ActorContextInput',
  fields: {
    provider: { type: GraphQLString },
  },
});
