import { type BaseGraphConfiguration } from '@/page-layout/widgets/graph/types/BaseGraphConfiguration';
import { type GraphOrderBy } from '@/page-layout/widgets/graph/types/GraphOrderBy';
import { type GraphType } from '@/page-layout/widgets/graph/types/GraphType';

export type PieChartConfiguration = BaseGraphConfiguration & {
  graphType: GraphType.PIE;
  groupByFieldMetadataId: string;
  orderBy: GraphOrderBy;
};
