import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';

type LimitTwoDimensionalLineChartDataParams = {
  sortedSeries: LineChartSeries[];
  isStacked: boolean;
};

type LimitTwoDimensionalLineChartDataResult = {
  limitedSeries: LineChartSeries[];
  hasTooManyGroups: boolean;
};

// TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
export const limitTwoDimensionalLineChartData = ({
  sortedSeries,
  isStacked,
}: LimitTwoDimensionalLineChartDataParams): LimitTwoDimensionalLineChartDataResult => {
  if (sortedSeries.length === 0) {
    return {
      limitedSeries: sortedSeries,
      hasTooManyGroups: false,
    };
  }

  const maxSeries = isStacked
    ? LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_STACKED_SERIES
    : LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_NON_STACKED_SERIES;

  const hasTooManySeries = sortedSeries.length > maxSeries;

  const dataPointCount = sortedSeries[0].data.length;
  const hasTooManyDataPoints =
    dataPointCount > LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS;

  const hasTooManyGroups = hasTooManySeries || hasTooManyDataPoints;

  if (!hasTooManyGroups) {
    return {
      limitedSeries: sortedSeries,
      hasTooManyGroups: false,
    };
  }

  const seriesLimited = sortedSeries.slice(0, maxSeries);

  const limitedSeries = seriesLimited.map((series) => ({
    ...series,
    data: series.data.slice(
      0,
      LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS,
    ),
  }));

  return {
    limitedSeries,
    hasTooManyGroups: true,
  };
};
