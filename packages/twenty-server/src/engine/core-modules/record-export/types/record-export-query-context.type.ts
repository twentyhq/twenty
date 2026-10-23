import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';

export type RecordExportQueryContext = {
  queryRunnerContext: CommonBaseQueryRunnerContext;
  columns: RecordExportColumn[];
  selectedFields: CommonSelectedFields;
};
