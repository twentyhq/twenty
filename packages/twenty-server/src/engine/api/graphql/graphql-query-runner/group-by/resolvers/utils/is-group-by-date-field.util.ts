import {
  type GroupByDateField,
  type GroupByField,
} from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';

export const isGroupByDateField = (
  groupByField: GroupByField,
): groupByField is GroupByDateField => {
  return (
    'dateGranularity' in groupByField &&
    !('nestedFieldMetadata' in groupByField)
  );
};
