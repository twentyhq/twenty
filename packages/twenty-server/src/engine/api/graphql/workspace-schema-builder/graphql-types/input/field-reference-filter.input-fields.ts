import { type GraphQLInputFieldConfigMap, GraphQLString } from 'graphql';
import { FIELD_REFERENCE_FILTER_OPERATORS } from 'twenty-shared/constants';

export const FIELD_REFERENCE_FILTER_INPUT_FIELDS: GraphQLInputFieldConfigMap =
  Object.fromEntries(
    Object.keys(FIELD_REFERENCE_FILTER_OPERATORS).map((operator) => [
      operator,
      { type: GraphQLString },
    ]),
  );
