import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';

export type AggregateChartOperation =
  | ExtendedAggregateOperations
  | typeof DASHBOARD_AGGREGATE_OPERATION_RATIO;
