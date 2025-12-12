import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

export const sortLineChartSeries = ({
  series,
  orderByY,
  manualSortOrder,
  formattedToRawLookup,
}: {
  series: LineChartSeries[];
  orderByY?: GraphOrderBy | null;
  manualSortOrder?: string[] | null;
  formattedToRawLookup?: Map<string, RawDimensionValue>;
}): LineChartSeries[] => {
  switch (orderByY) {
    case GraphOrderBy.FIELD_ASC:
      return [...series].sort((a, b) => b.id.localeCompare(a.id));
    case GraphOrderBy.FIELD_DESC:
      return [...series].sort((a, b) => a.id.localeCompare(b.id));
    case GraphOrderBy.MANUAL: {
      if (!isDefined(manualSortOrder)) {
        return series;
      }

      return sortByManualOrder({
        items: series,
        manualSortOrder,
        getRawValue: (item) => {
          const rawValue = formattedToRawLookup?.get(item.id);

          return isDefined(rawValue) ? String(rawValue) : item.id;
        },
      });
    }
    default:
      return series;
  }
};
