import { type BaseAggregateChartConfiguration } from '@/page-layout/widgets/graph/types/BaseAggregateChartConfiguration';
import { type GraphOrderBy } from '@/page-layout/widgets/graph/types/GraphOrderBy';
import { type GraphType } from '@/page-layout/mocks/mockWidgets';

export interface LineChartConfiguration
  extends BaseAggregateChartConfiguration {
  graphType: GraphType.LINE;
  groupByFieldMetadataIdX: string;
  orderByX: GraphOrderBy;
  groupByFieldMetadataIdY?: string;
  orderByY?: GraphOrderBy;
  omitNullValues?: boolean;
  xAxisName?: string;
  yAxisName?: string;
  rangeMin?: number;
  rangeMax?: number;
}
