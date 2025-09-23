import { type BaseAggregateChartConfiguration } from '@/page-layout/widgets/graph/types/BaseAggregateChartConfiguration';
import { type GraphOrderBy } from '@/page-layout/widgets/graph/types/GraphOrderBy';
import { type GraphType } from '@/page-layout/mocks/mockWidgets';

export interface PieChartConfiguration extends BaseAggregateChartConfiguration {
  graphType: GraphType.PIE;
  groupByFieldMetadataId: string;
  orderBy: GraphOrderBy;
}
