import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { GraphOrderBy } from '~/generated/graphql';

const normalizeXValue = (x: number | string | Date): string => {
  if (x instanceof Date) {
    return x.toISOString();
  }
  return String(x);
};

export const sortLineChartDataPoints = ({
  dataPoints,
  orderBy,
}: {
  dataPoints: LineChartDataPoint[];
  orderBy?: GraphOrderBy | null;
}): LineChartDataPoint[] => {
  switch (orderBy) {
    case GraphOrderBy.FIELD_ASC:
      return [...dataPoints].sort((a, b) =>
        normalizeXValue(a.x).localeCompare(normalizeXValue(b.x)),
      );
    case GraphOrderBy.FIELD_DESC:
      return [...dataPoints].sort((a, b) =>
        normalizeXValue(b.x).localeCompare(normalizeXValue(a.x)),
      );
    default:
      return dataPoints;
  }
};
