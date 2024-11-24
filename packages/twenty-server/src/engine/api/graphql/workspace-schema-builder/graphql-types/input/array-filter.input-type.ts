import { GraphQLBoolean, GraphQLInputObjectType, GraphQLString } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const ArrayFilterType = new GraphQLInputObjectType({
  name: 'ArrayFilter',
  fields: {
    containsIlike: { type: GraphQLString },
    is: { type: FilterIs },
    isEmptyArray: { type: GraphQLBoolean },
  },
});
