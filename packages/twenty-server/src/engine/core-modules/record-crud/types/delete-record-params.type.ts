import { type RecordCrudExecutionContext } from './execution-context.type';
import { type DeleteRecordInput } from './record-crud-input.type';

export type DeleteRecordParams = DeleteRecordInput &
  RecordCrudExecutionContext & {
    soft?: boolean;
  };
