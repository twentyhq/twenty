import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type TrackedJobPageQuery = {
  queryRunnerContext: CommonBaseQueryRunnerContext;
  selectedFields: CommonSelectedFields;
  filter?: Partial<ObjectRecordFilter>;
  orderBy?: ObjectRecordOrderBy;
};
