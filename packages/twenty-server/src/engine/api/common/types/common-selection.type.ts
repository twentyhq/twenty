import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

export type CommonSelection = {
  columns: Record<string, true>;
  aggregates: Record<string, AggregationField>;
  relations: Partial<Record<string, CommonRelationSelection>>;
};

export type CommonRelationSelection = {
  fieldName: string;
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  selection: CommonSelection;
};
