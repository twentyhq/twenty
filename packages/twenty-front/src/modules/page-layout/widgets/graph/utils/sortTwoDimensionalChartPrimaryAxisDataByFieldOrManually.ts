import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { sortBySelectOptionPosition } from '@/page-layout/widgets/graph/utils/sortBySelectOptionPosition';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type SortTwoDimensionalChartPrimaryAxisDataParams<T> = {
  data: T[];
  orderBy?:
    | GraphOrderBy.FIELD_ASC
    | GraphOrderBy.FIELD_DESC
    | GraphOrderBy.FIELD_POSITION_ASC
    | GraphOrderBy.FIELD_POSITION_DESC
    | GraphOrderBy.MANUAL;
  manualSortOrder?: string[] | null;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  getFormattedValue: (item: T) => string;
  selectFieldOptions?: FieldMetadataItemOption[] | null;
};

export const sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually = <T>({
  data,
  orderBy,
  manualSortOrder,
  formattedToRawLookup,
  getFormattedValue,
  selectFieldOptions,
}: SortTwoDimensionalChartPrimaryAxisDataParams<T>): T[] => {
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
          const formattedValue = getFormattedValue(item);
          const rawValue = formattedToRawLookup.get(formattedValue);

          return isDefined(rawValue) ? String(rawValue) : formattedValue;
        },
      });
    }

    case GraphOrderBy.FIELD_ASC:
      return data.toSorted((a, b) =>
        getFormattedValue(a).localeCompare(getFormattedValue(b)),
      );

    case GraphOrderBy.FIELD_DESC:
      return data.toSorted((a, b) =>
        getFormattedValue(b).localeCompare(getFormattedValue(a)),
      );

    case GraphOrderBy.FIELD_POSITION_ASC:
    case GraphOrderBy.FIELD_POSITION_DESC: {
      if (!isDefined(selectFieldOptions) || selectFieldOptions.length === 0) {
        throw new Error(
          'Select field options are required for field position sorting',
        );
      }

      return sortBySelectOptionPosition({
        items: data,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue,
        direction: orderBy === GraphOrderBy.FIELD_POSITION_ASC ? 'ASC' : 'DESC',
      });
    }

    default:
      assertUnreachable(orderBy);
  }
};
