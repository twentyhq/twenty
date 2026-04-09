import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type RecordCrudExecutionContext } from './record-crud-execution-context.type';
import { type FindRecordsInput } from './record-crud-input.type';

export type FindRecordsParams = FindRecordsInput &
  RecordCrudExecutionContext & {
    filter?:
      | Record<string, unknown>
      | Record<string, unknown>[]
      | Partial<ObjectRecordFilter>
      | Partial<ObjectRecordFilter>[];
    orderBy?: Partial<ObjectRecordOrderBy>;
    offset?: number;
  };
