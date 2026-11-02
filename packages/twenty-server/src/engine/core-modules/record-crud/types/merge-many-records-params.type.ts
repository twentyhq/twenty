import { type MergeManyQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { type RecordCrudExecutionContext } from 'src/engine/core-modules/record-crud/types/record-crud-execution-context.type';

export type MergeManyRecordsParams = MergeManyQueryArgs &
  RecordCrudExecutionContext & {
    objectName: string;
  };
