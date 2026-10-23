import {
  GraphQLInputObjectType,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

import { FIELD_REFERENCE_FILTER_INPUT_FIELDS } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/field-reference-filter.input-fields';
import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const FloatFilterType = new GraphQLInputObjectType({
  name: 'FloatFilter',
  fields: {
    eq: { type: GraphQLFloat },
    gt: { type: GraphQLFloat },
    gte: { type: GraphQLFloat },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLFloat)) },
    lt: { type: GraphQLFloat },
    lte: { type: GraphQLFloat },
    neq: { type: GraphQLFloat },
    is: { type: FilterIs },
    ...FIELD_REFERENCE_FILTER_INPUT_FIELDS,
  },
});
