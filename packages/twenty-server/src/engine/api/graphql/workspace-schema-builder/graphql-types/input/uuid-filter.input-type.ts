import { GraphQLInputObjectType, GraphQLList } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const UUIDFilterType = new GraphQLInputObjectType({
  name: 'UUIDFilter',
  fields: {
    eq: { type: UUIDScalarType },
    gt: { type: UUIDScalarType },
    gte: { type: UUIDScalarType },
    in: { type: new GraphQLList(UUIDScalarType) },
    lt: { type: UUIDScalarType },
    lte: { type: UUIDScalarType },
    neq: { type: UUIDScalarType },
    is: { type: FilterIs },
  },
});
