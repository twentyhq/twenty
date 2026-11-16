import { type NestedRelationQueryArgsByFieldName } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args-by-field-name.type';
import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type NestedRelationQueryArgs = {
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  nestedRelationQueryArgsByFieldName: NestedRelationQueryArgsByFieldName;
};
