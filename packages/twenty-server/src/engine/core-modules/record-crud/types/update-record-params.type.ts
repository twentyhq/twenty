import { type RecordCrudExecutionContext } from './execution-context.type';
import { type UpdateRecordInput } from './record-crud-input.type';

export type UpdateRecordParams = UpdateRecordInput & RecordCrudExecutionContext;
