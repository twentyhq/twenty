import { GraphQLInputObjectType, GraphQLString } from 'graphql';

const richTextV2LeafFilter = new GraphQLInputObjectType({
  name: 'RichTextV2LeafFilter',
  fields: {
    ilike: {
      type: GraphQLString,
      description: 'Case-insensitive match with % wildcard (e.g. %value%)',
    },
  },
});

export const RichTextV2FilterType = new GraphQLInputObjectType({
  name: 'RichTextV2Filter',
  fields: {
    blocknote: { type: richTextV2LeafFilter },
    markdown: { type: richTextV2LeafFilter },
  },
});
