import { GraphQLInputObjectType } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const JsonFilterType = new GraphQLInputObjectType({
  name: 'JsonFilter',
  fields: {
    is: { type: FilterIs },
  },
});
