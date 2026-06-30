import {
  type GroupByField,
  type GroupByRelationField,
} from 'src/engine/api/common/common-query-runners/types/group-by-field.types';

export const isGroupByRelationField = (
  groupByField: GroupByField,
): groupByField is GroupByRelationField => {
  return 'nestedFieldMetadata' in groupByField;
};
