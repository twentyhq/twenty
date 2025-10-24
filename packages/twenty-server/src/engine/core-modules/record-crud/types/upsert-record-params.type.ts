import { type RecordCrudExecutionContext } from './execution-context.type';
import { type UpsertRecordInput } from './record-crud-input.type';

export type UpsertRecordParams = UpsertRecordInput & RecordCrudExecutionContext;
