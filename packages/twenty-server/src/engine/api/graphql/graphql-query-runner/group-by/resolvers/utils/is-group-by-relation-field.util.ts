import {
  type GroupByField,
  type GroupByRelationField,
} from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';

export const isGroupByRelationField = (
  groupByField: GroupByField,
): groupByField is GroupByRelationField => {
  return 'nestedFieldMetadata' in groupByField;
};
