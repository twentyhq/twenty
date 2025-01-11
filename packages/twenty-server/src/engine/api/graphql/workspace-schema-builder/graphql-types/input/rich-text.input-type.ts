import { GraphQLInputObjectType, GraphQLString } from 'graphql';

const richTextLeafFilter = new GraphQLInputObjectType({
  name: 'RichTextLeafFilter',
  fields: {
    ilike: { type: GraphQLString },
  },
});

export const RichTextFilterType = new GraphQLInputObjectType({
  name: 'RichTextFilter',
  fields: {
    blocknote: { type: richTextLeafFilter },
    markdown: { type: richTextLeafFilter },
  },
});
