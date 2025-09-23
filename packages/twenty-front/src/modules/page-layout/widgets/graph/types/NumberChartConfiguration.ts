import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type GraphType } from '@/page-layout/mocks/mockWidgets';

export interface NumberChartConfiguration {
  graphType: GraphType.NUMBER;
  aggregateOperation: AggregateOperations;
  aggregateFieldMetadataId: string;
  filter?: RecordGqlOperationFilter;
  description?: string;
}
