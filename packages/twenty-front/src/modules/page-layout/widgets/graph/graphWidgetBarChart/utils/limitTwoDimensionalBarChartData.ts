import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type BarDatum } from '@nivo/bar';
import { BarChartGroupMode } from '~/generated/graphql';

type LimitTwoDimensionalBarChartDataParams = {
  sortedData: BarDatum[];
  sortedKeys: string[];
  sortedSeries: BarChartSeries[];
  groupMode?: BarChartGroupMode | null;
};

type LimitTwoDimensionalBarChartDataResult = {
  limitedData: BarDatum[];
  limitedKeys: string[];
  limitedSeries: BarChartSeries[];
  hasTooManyGroups: boolean;
};

// TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
export const limitTwoDimensionalBarChartData = ({
  sortedData,
  sortedKeys,
  sortedSeries,
  groupMode,
}: LimitTwoDimensionalBarChartDataParams): LimitTwoDimensionalBarChartDataResult => {
  const effectiveGroupMode = groupMode ?? BarChartGroupMode.STACKED;

  const hasTooManyBars =
    sortedData.length > BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS;
  const hasTooManyGroups =
    sortedKeys.length > BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_GROUPS_PER_BAR;

  const limitedData = sortedData.slice(
    0,
    BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS,
  );
  const limitedKeys = sortedKeys.slice(
    0,
    BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_GROUPS_PER_BAR,
  );
  const limitedSeries = sortedSeries.slice(
    0,
    BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_GROUPS_PER_BAR,
  );

  if (effectiveGroupMode === BarChartGroupMode.STACKED) {
    return {
      limitedData,
      limitedKeys,
      limitedSeries,
      hasTooManyGroups: hasTooManyBars || hasTooManyGroups,
    };
  }

  const totalSegments = limitedData.length * limitedKeys.length;
  const hasTooManySegments =
    totalSegments > BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS;

  if (!hasTooManySegments) {
    return {
      limitedData,
      limitedKeys,
      limitedSeries,
      hasTooManyGroups: hasTooManyBars || hasTooManyGroups,
    };
  }

  const maxXValues = Math.floor(
    BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS / limitedKeys.length,
  );
  const furtherLimitedData = limitedData.slice(0, Math.max(1, maxXValues));

  return {
    limitedData: furtherLimitedData,
    limitedKeys,
    limitedSeries,
    hasTooManyGroups: true,
  };
};
