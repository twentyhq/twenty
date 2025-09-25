import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type GraphType } from '@/page-layout/widgets/graph/types/GraphType';

export type GaugeChartConfiguration = {
  graphType: GraphType.GAUGE;
  aggregateOperation: AggregateOperations;
  aggregateFieldMetadataId: string;
  aggregateOperationTotal: AggregateOperations;
  aggregateFieldMetadataIdTotal: string;
  filter?: RecordGqlOperationFilter;
  description?: string;
};
