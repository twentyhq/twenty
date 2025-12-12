import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type SortChartDataParams<T> = {
  data: T[];
  orderBy?: GraphOrderBy | null;
  manualSortOrder?: string[] | null;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  getFieldValue: (item: T) => string;
  getNumericValue: (item: T) => number;
};

export const sortChartData = <T>({
  data,
  orderBy,
  manualSortOrder,
  formattedToRawLookup,
  getFieldValue,
  getNumericValue,
}: SortChartDataParams<T>): T[] => {
  if (!isDefined(orderBy)) {
    return data;
  }

  switch (orderBy) {
    case GraphOrderBy.MANUAL: {
      if (!isDefined(manualSortOrder)) {
        return data;
      }

      return sortByManualOrder({
        items: data,
        manualSortOrder,
        getRawValue: (item) => {
          const formatted = getFieldValue(item);
          const raw = formattedToRawLookup.get(formatted);

          return isDefined(raw) ? String(raw) : formatted;
        },
      });
    }
    case GraphOrderBy.VALUE_ASC:
      return [...data].sort((a, b) => getNumericValue(a) - getNumericValue(b));
    case GraphOrderBy.VALUE_DESC:
      return [...data].sort((a, b) => getNumericValue(b) - getNumericValue(a));
    case GraphOrderBy.FIELD_ASC:
      return [...data].sort((a, b) =>
        getFieldValue(a).localeCompare(getFieldValue(b)),
      );
    case GraphOrderBy.FIELD_DESC:
      return [...data].sort((a, b) =>
        getFieldValue(b).localeCompare(getFieldValue(a)),
      );
    default:
      return data;
  }
};
