import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type RecordExportColumn } from 'twenty-shared/types';

export type RecordExportQueryContext = {
  queryRunnerContext: CommonBaseQueryRunnerContext;
  columns: RecordExportColumn[];
  selectedFields: CommonSelectedFields;
};
