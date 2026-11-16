import { type NestedRelationQueryArgsByFieldName } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args-by-field-name.type';
import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type NestedRelationQueryArgs = {
  filter?: ObjectRecordFilter;
  // The stored filter of a filtered relation, written in the computed field expression language
  expressionFilter?: string;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  nestedRelationQueryArgsByFieldName: NestedRelationQueryArgsByFieldName;
};
