import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const isVectorSearchFilter = (filter: RecordFilter) => {
  return filter.operand === ViewFilterOperand.VectorSearch;
};
