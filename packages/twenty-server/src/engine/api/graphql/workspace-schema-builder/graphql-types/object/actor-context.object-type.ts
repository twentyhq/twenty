import { GraphQLObjectType, GraphQLString } from 'graphql';

export const ActorContextObjectType = new GraphQLObjectType({
  name: 'ActorContext',
  fields: {
    provider: { type: GraphQLString },
  },
});
