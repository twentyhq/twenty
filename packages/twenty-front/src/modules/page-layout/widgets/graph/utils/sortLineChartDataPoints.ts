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
    case GraphOrderBy.VALUE_ASC:
      return [...dataPoints].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
    case GraphOrderBy.VALUE_DESC:
      return [...dataPoints].sort((a, b) => (b.y ?? 0) - (a.y ?? 0));
    default:
      return dataPoints;
  }
};
