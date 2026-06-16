import { type RecordCrudExecutionContext } from 'src/engine/core-modules/record-crud/types/record-crud-execution-context.type';

export type QueryRecordsParams = RecordCrudExecutionContext & {
  // Raw tool arguments, validated against QueryToolInputSchema by the service.
  input: unknown;
};
