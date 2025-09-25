import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type BaseGraphConfiguration } from '@/page-layout/widgets/graph/types/BaseGraphConfiguration';
import { type GraphType } from '@/page-layout/widgets/graph/types/GraphType';

export type GaugeChartConfiguration = Omit<BaseGraphConfiguration, 'color'> & {
  graphType: GraphType.GAUGE;
  aggregateOperationTotal: AggregateOperations;
  aggregateFieldMetadataIdTotal: string;
};
