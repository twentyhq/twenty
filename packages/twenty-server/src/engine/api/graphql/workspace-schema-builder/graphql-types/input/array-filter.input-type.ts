import { GraphQLBoolean, GraphQLInputObjectType, GraphQLString } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const ArrayFilterType = new GraphQLInputObjectType({
  name: 'ArrayFilter',
  fields: {
    containsIlike: {
      type: GraphQLString,
      description: 'Case-insensitive match with % wildcard (e.g. %value%)',
    },
    is: { type: FilterIs },
    isEmptyArray: { type: GraphQLBoolean },
  },
});
