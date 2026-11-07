import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { GraphQLBigInt } from 'graphql-scalars';

import { FIELD_REFERENCE_FILTER_INPUT_FIELDS } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/field-reference-filter.input-fields';
import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const BigIntFilterType = new GraphQLInputObjectType({
  name: 'BigIntFilter',
  fields: {
    eq: { type: GraphQLBigInt },
    gt: { type: GraphQLBigInt },
    gte: { type: GraphQLBigInt },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLBigInt)) },
    lt: { type: GraphQLBigInt },
    lte: { type: GraphQLBigInt },
    neq: { type: GraphQLBigInt },
    is: { type: FilterIs },
    ...FIELD_REFERENCE_FILTER_INPUT_FIELDS,
  },
});
