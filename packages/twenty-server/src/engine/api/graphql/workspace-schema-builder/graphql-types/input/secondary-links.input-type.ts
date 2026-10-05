import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const SecondaryLinkInputType = new GraphQLInputObjectType({
  name: 'SecondaryLinkInput',
  fields: {
    label: { type: GraphQLString },
    url: { type: GraphQLString },
  },
});

export const SecondaryLinksInputType = new GraphQLList(
  new GraphQLNonNull(SecondaryLinkInputType),
);
