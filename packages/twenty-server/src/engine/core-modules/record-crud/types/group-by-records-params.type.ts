import { type AggregateOperations } from 'twenty-shared/types';

import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type RecordCrudExecutionContext } from './record-crud-execution-context.type';

export type GroupByRecordsParams = RecordCrudExecutionContext & {
  objectName: string;
  groupBy: ObjectRecordGroupBy;
  aggregateOperation?: keyof typeof AggregateOperations;
  aggregateFieldName?: string;
  limit?: number;
  orderBy?: 'ASC' | 'DESC';
  filter?: Record<string, unknown>;
};
