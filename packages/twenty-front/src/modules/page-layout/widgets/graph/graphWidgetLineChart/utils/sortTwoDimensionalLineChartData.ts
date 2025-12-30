import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { sortLineChartDataBySecondaryDimensionSum } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/sortLineChartDataBySecondaryDimensionSum';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortSecondaryAxisData } from '@/page-layout/widgets/graph/utils/sortSecondaryAxisData';
import { sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually } from '@/page-layout/widgets/graph/utils/sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually';
import { isDefined } from 'twenty-shared/utils';
import { type LineChartConfiguration, GraphOrderBy } from '~/generated/graphql';

type SortTwoDimensionalLineChartDataConfiguration = {
  series: LineChartSeries[];
  configuration: LineChartConfiguration;
  primaryAxisFormattedToRawLookup: Map<string, RawDimensionValue>;
  primaryAxisSelectFieldOptions?: FieldMetadataItemOption[] | null;
  secondaryAxisFormattedToRawLookup?: Map<string, RawDimensionValue>;
  secondaryAxisSelectFieldOptions?: FieldMetadataItemOption[] | null;
};

type SortTwoDimensionalLineChartDataResult = {
  sortedSeries: LineChartSeries[];
};

export const sortTwoDimensionalLineChartData = ({
  series,
  configuration: {
    primaryAxisOrderBy,
    primaryAxisManualSortOrder,
    secondaryAxisOrderBy,
    secondaryAxisManualSortOrder,
  },
  primaryAxisFormattedToRawLookup,
  primaryAxisSelectFieldOptions,
  secondaryAxisFormattedToRawLookup,
  secondaryAxisSelectFieldOptions,
}: SortTwoDimensionalLineChartDataConfiguration): SortTwoDimensionalLineChartDataResult => {
  let sortedSeries = series;

  if (isDefined(primaryAxisOrderBy)) {
    if (
      primaryAxisOrderBy === GraphOrderBy.VALUE_ASC ||
      primaryAxisOrderBy === GraphOrderBy.VALUE_DESC
    ) {
      sortedSeries = sortLineChartDataBySecondaryDimensionSum({
        series,
        orderBy: primaryAxisOrderBy,
      });
    } else {
      sortedSeries = series.map((seriesItem) => {
        const sortedDataPoints =
          sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually({
            data: seriesItem.data,
            orderBy: primaryAxisOrderBy,
            manualSortOrder: primaryAxisManualSortOrder,
            formattedToRawLookup: primaryAxisFormattedToRawLookup,
            getFormattedValue: (dataPoint: LineChartDataPoint) =>
              String(dataPoint.x),
            selectFieldOptions: primaryAxisSelectFieldOptions,
          });

        return {
          ...seriesItem,
          data: sortedDataPoints,
        };
      });
    }
  }

  sortedSeries = sortSecondaryAxisData({
    items: sortedSeries,
    orderBy: secondaryAxisOrderBy,
    manualSortOrder: secondaryAxisManualSortOrder,
    formattedToRawLookup: secondaryAxisFormattedToRawLookup,
    selectFieldOptions: secondaryAxisSelectFieldOptions,
    getFormattedValue: (item) => item.id,
  });

  return {
    sortedSeries,
  };
};
