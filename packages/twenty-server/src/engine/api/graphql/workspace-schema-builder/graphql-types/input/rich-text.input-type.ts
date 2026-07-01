import { GraphQLInputObjectType, GraphQLString } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

const richTextLeafFilter = new GraphQLInputObjectType({
  name: 'RichTextLeafFilter',
  fields: {
    ilike: {
      type: GraphQLString,
      description: 'Case-insensitive match with % wildcard (e.g. %value%)',
    },
    is: { type: FilterIs },
  },
});

export const RichTextFilterType = new GraphQLInputObjectType({
  name: 'RichTextFilter',
  fields: {
    blocknote: { type: richTextLeafFilter },
    markdown: { type: richTextLeafFilter },
  },
});
