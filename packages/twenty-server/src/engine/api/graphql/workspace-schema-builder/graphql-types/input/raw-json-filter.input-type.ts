import { GraphQLInputObjectType } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const RawJsonFilterType = new GraphQLInputObjectType({
  name: 'RawJsonFilter',
  fields: {
    is: { type: FilterIs },
  },
});
