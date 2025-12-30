import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { sortBarChartDataBySecondaryDimensionSum } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/sortBarChartDataBySecondaryDimensionSum';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortSecondaryAxisData } from '@/page-layout/widgets/graph/utils/sortSecondaryAxisData';
import { sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually } from '@/page-layout/widgets/graph/utils/sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually';
import { type BarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration, GraphOrderBy } from '~/generated/graphql';

type SortTwoDimensionalBarChartDataConfiguration = {
  data: BarDatum[];
  keys: string[];
  indexByKey: string;
  configuration: BarChartConfiguration;
  primaryAxisFormattedToRawLookup: Map<string, RawDimensionValue>;
  primaryAxisSelectFieldOptions?: FieldMetadataItemOption[] | null;
  secondaryAxisFormattedToRawLookup?: Map<string, RawDimensionValue>;
  secondaryAxisSelectFieldOptions?: FieldMetadataItemOption[] | null;
};

type SortTwoDimensionalBarChartDataResult = {
  sortedData: BarDatum[];
  sortedKeys: string[];
  sortedSeries: BarChartSeries[];
};

export const sortTwoDimensionalBarChartData = ({
  data,
  keys,
  indexByKey,
  configuration: {
    primaryAxisOrderBy,
    primaryAxisManualSortOrder,
    secondaryAxisOrderBy,
    secondaryAxisManualSortOrder,
    color,
  },
  primaryAxisFormattedToRawLookup,
  primaryAxisSelectFieldOptions,
  secondaryAxisFormattedToRawLookup,
  secondaryAxisSelectFieldOptions,
}: SortTwoDimensionalBarChartDataConfiguration): SortTwoDimensionalBarChartDataResult => {
  const sortedKeys = sortSecondaryAxisData({
    items: keys,
    orderBy: secondaryAxisOrderBy,
    manualSortOrder: secondaryAxisManualSortOrder,
    formattedToRawLookup: secondaryAxisFormattedToRawLookup,
    selectFieldOptions: secondaryAxisSelectFieldOptions,
    getFormattedValue: (item) => item,
  });

  const sortedSeries: BarChartSeries[] = sortedKeys.map((key) => ({
    key,
    label: key,
    color: color as GraphColor,
  }));

  let sortedData: BarDatum[] = data;

  if (isDefined(primaryAxisOrderBy)) {
    if (
      primaryAxisOrderBy === GraphOrderBy.VALUE_ASC ||
      primaryAxisOrderBy === GraphOrderBy.VALUE_DESC
    ) {
      sortedData = sortBarChartDataBySecondaryDimensionSum({
        data,
        keys: sortedKeys,
        orderBy: primaryAxisOrderBy,
      });
    } else {
      sortedData = sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually({
        data,
        orderBy: primaryAxisOrderBy,
        manualSortOrder: primaryAxisManualSortOrder,
        formattedToRawLookup: primaryAxisFormattedToRawLookup,
        getFormattedValue: (datum) => datum[indexByKey] as string,
        selectFieldOptions: primaryAxisSelectFieldOptions,
      });
    }
  }

  return {
    sortedData,
    sortedKeys,
    sortedSeries,
  };
};
