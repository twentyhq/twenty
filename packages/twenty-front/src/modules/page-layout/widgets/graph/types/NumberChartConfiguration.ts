import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { GraphType } from '@/page-layout/widgets/graph/types/GraphType';

export type NumberChartConfiguration = {
  graphType: GraphType.NUMBER;
  aggregateOperation: AggregateOperations;
  aggregateFieldMetadataId: string;
  filter?: RecordGqlOperationFilter;
  description?: string;
};
