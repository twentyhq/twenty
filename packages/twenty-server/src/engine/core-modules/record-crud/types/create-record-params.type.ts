import { type CreateRecordExecutionContext } from './create-record-execution-context.type';
import { type RecordCrudExecutionContext } from './record-crud-execution-context.type';
import { type CreateRecordInput } from './record-crud-input.type';

export type CreateRecordParams = CreateRecordInput &
  Omit<CreateRecordExecutionContext, 'upsert'> & {
    upsert?: never;
  };

export type CreateRecordParamsWithContext = CreateRecordInput &
  RecordCrudExecutionContext;
