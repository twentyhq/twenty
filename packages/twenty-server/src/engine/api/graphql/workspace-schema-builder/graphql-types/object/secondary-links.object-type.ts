import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const SecondaryLinkObjectType = new GraphQLObjectType({
  name: 'SecondaryLink',
  fields: {
    label: { type: GraphQLString },
    url: { type: GraphQLString },
  },
});

export const SecondaryLinksObjectType = new GraphQLList(
  new GraphQLNonNull(SecondaryLinkObjectType),
);
