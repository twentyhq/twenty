import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { sortBySelectOptionPosition } from '@/page-layout/widgets/graph/utils/sortBySelectOptionPosition';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type SortChartDataParams<T> = {
  data: T[];
  orderBy?: GraphOrderBy | null;
  manualSortOrder?: string[] | null;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  getFieldValue: (item: T) => string;
  getNumericValue: (item: T) => number;
  selectFieldOptions?: FieldMetadataItemOption[] | null;
};

export const sortChartData = <T>({
  data,
  orderBy,
  manualSortOrder,
  formattedToRawLookup,
  getFieldValue,
  getNumericValue,
  selectFieldOptions,
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
      return data.toSorted((a, b) => getNumericValue(a) - getNumericValue(b));
    case GraphOrderBy.VALUE_DESC:
      return data.toSorted((a, b) => getNumericValue(b) - getNumericValue(a));
    case GraphOrderBy.FIELD_ASC:
      return data.toSorted((a, b) =>
        getFieldValue(a).localeCompare(getFieldValue(b)),
      );
    case GraphOrderBy.FIELD_DESC:
      return data.toSorted((a, b) =>
        getFieldValue(b).localeCompare(getFieldValue(a)),
      );
    case GraphOrderBy.FIELD_POSITION_ASC:
      if (!isDefined(selectFieldOptions) || selectFieldOptions.length === 0) {
        throw new Error('Select field options are required');
      }

      return sortBySelectOptionPosition<T>({
        items: data,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: getFieldValue,
        direction: 'ASC',
      });
    case GraphOrderBy.FIELD_POSITION_DESC:
      if (!isDefined(selectFieldOptions) || selectFieldOptions.length === 0) {
        throw new Error('Select field options are required');
      }

      return sortBySelectOptionPosition<T>({
        items: data,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: getFieldValue,
        direction: 'DESC',
      });
    default:
      return data;
  }
};
