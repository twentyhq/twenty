import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { GraphOrderBy } from '~/generated/graphql';

export const sortLineChartSeries = ({
  series,
  orderByY,
}: {
  series: LineChartSeries[];
  orderByY?: GraphOrderBy | null;
}): LineChartSeries[] => {
  switch (orderByY) {
    case GraphOrderBy.FIELD_ASC:
      return [...series].sort((a, b) => b.id.localeCompare(a.id));
    case GraphOrderBy.FIELD_DESC:
      return [...series].sort((a, b) => a.id.localeCompare(b.id));
    default:
      return series;
  }
};
