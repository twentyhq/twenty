import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

export const isVectorSearchFilter = (filter: RecordFilter) => {
  return filter.operand === ViewFilterOperand.VectorSearch;
};
