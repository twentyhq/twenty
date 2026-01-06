import { type UpdateRecordInput } from './record-crud-input.type';
import { type UpdateRecordExecutionContext } from './update-record-execution-context.type';

export type UpdateRecordParams = UpdateRecordInput &
  UpdateRecordExecutionContext;
