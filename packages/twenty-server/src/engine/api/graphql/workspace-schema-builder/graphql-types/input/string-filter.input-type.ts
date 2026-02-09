import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const StringFilterType = new GraphQLInputObjectType({
  name: 'StringFilter',
  fields: {
    eq: { type: GraphQLString },
    gt: { type: GraphQLString },
    gte: { type: GraphQLString },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    lt: { type: GraphQLString },
    lte: { type: GraphQLString },
    neq: { type: GraphQLString },
    startsWith: { type: GraphQLString },
    like: {
      type: GraphQLString,
      description: 'Pattern match with % wildcard',
    },
    ilike: {
      type: GraphQLString,
      description: 'Case-insensitive match with % wildcard',
    },
    regex: { type: GraphQLString },
    iregex: { type: GraphQLString },
    is: { type: FilterIs },
  },
});
