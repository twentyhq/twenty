import { type BaseGraphConfiguration } from '@/page-layout/widgets/graph/types/BaseGraphConfiguration';
import { type GraphOrderBy } from '@/page-layout/widgets/graph/types/GraphOrderBy';
import { type GraphType } from '@/page-layout/mocks/mockWidgets';

export type LineChartConfiguration = BaseGraphConfiguration & {
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
};
