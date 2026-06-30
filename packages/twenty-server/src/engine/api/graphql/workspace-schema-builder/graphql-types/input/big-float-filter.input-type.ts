import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';
import { BigFloatScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const BigFloatFilterType = new GraphQLInputObjectType({
  name: 'BigFloatFilter',
  fields: {
    eq: { type: BigFloatScalarType },
    gt: { type: BigFloatScalarType },
    gte: { type: BigFloatScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(BigFloatScalarType)) },
    lt: { type: BigFloatScalarType },
    lte: { type: BigFloatScalarType },
    neq: { type: BigFloatScalarType },
    is: { type: FilterIs },
  },
});
