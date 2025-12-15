import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { sortBySelectOptionPosition } from '@/page-layout/widgets/graph/utils/sortBySelectOptionPosition';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

export const sortLineChartSeries = ({
  series,
  orderByY,
  manualSortOrder,
  formattedToRawLookup,
  selectFieldOptions,
}: {
  series: LineChartSeries[];
  orderByY?: GraphOrderBy | null;
  manualSortOrder?: string[] | null;
  formattedToRawLookup?: Map<string, RawDimensionValue>;
  selectFieldOptions?: FieldMetadataItemOption[] | null;
}): LineChartSeries[] => {
  switch (orderByY) {
    case GraphOrderBy.FIELD_ASC:
      return series.toSorted((a, b) => b.id.localeCompare(a.id));
    case GraphOrderBy.FIELD_DESC:
      return series.toSorted((a, b) => a.id.localeCompare(b.id));
    case GraphOrderBy.FIELD_POSITION_ASC:
      if (
        !isDefined(selectFieldOptions) ||
        selectFieldOptions.length === 0 ||
        !isDefined(formattedToRawLookup)
      ) {
        throw new Error(
          'Select field options and formatted to raw lookup are required',
        );
      }

      return sortBySelectOptionPosition({
        items: series,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'ASC',
      });
    case GraphOrderBy.FIELD_POSITION_DESC:
      if (
        !isDefined(selectFieldOptions) ||
        selectFieldOptions.length === 0 ||
        !isDefined(formattedToRawLookup)
      ) {
        throw new Error(
          'Select field options and formatted to raw lookup are required',
        );
      }

      return sortBySelectOptionPosition({
        items: series,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'DESC',
      });

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
