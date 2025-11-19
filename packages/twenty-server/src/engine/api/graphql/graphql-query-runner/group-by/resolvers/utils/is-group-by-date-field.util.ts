import {
  type GroupByDateField,
  type GroupByField,
  type GroupByRelationField,
} from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';

export const isGroupByDateField = (
  groupByField: GroupByField,
): groupByField is GroupByDateField => {
  return (
    'dateGranularity' in groupByField &&
    !('nestedFieldMetadata' in groupByField)
  );
};

export const isGroupByRelationField = (
  groupByField: GroupByField,
): groupByField is GroupByRelationField => {
  return 'nestedFieldMetadata' in groupByField;
};
