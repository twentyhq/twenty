import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type ProcessedTwoDimensionalDataPoint } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';
import { type BarDatum } from '@nivo/bar';
import { BarChartGroupMode } from '~/generated/graphql';

type BuildTwoDimensionalBarChartDataParams = {
  processedDataPoints: ProcessedTwoDimensionalDataPoint[];
  indexByKey: string;
  groupMode?: BarChartGroupMode | null;
};

type BuildTwoDimensionalBarChartDataResult = {
  unsortedData: BarDatum[];
  yValues: Set<string>;
  hasTooManyGroups: boolean;
};

export const buildTwoDimensionalBarChartData = ({
  processedDataPoints,
  indexByKey,
  groupMode,
}: BuildTwoDimensionalBarChartDataParams): BuildTwoDimensionalBarChartDataResult => {
  const dataMap = new Map<string, BarDatum>();
  const xValues = new Set<string>();
  const yValues = new Set<string>();
  const effectiveGroupMode = groupMode ?? BarChartGroupMode.STACKED;
  let hasTooManyGroups = false;

  // TODO: Add a limit to the query instead of checking here (issue: twentyhq/core-team-issues#1600)
  for (const { xValue, yValue, aggregateValue } of processedDataPoints) {
    const isNewX = !xValues.has(xValue);
    const isNewY = !yValues.has(yValue);

    if (effectiveGroupMode === BarChartGroupMode.STACKED) {
      if (
        isNewX &&
        xValues.size >= BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS
      ) {
        hasTooManyGroups = true;
        continue;
      }
    }

    if (effectiveGroupMode === BarChartGroupMode.GROUPED) {
      const totalUniqueDimensions = xValues.size * yValues.size;
      const additionalDimensions =
        (isNewX ? 1 : 0) * yValues.size +
        (isNewY ? 1 : 0) * xValues.size +
        (isNewX && isNewY ? 1 : 0);

      if (
        totalUniqueDimensions + additionalDimensions >
        BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS
      ) {
        hasTooManyGroups = true;
        continue;
      }
    }

    xValues.add(xValue);
    yValues.add(yValue);

    if (!dataMap.has(xValue)) {
      dataMap.set(xValue, {
        [indexByKey]: xValue,
      });
    }

    const dataItem = dataMap.get(xValue)!;
    dataItem[yValue] = aggregateValue;
  }

  return {
    unsortedData: Array.from(dataMap.values()),
    yValues,
    hasTooManyGroups,
  };
};
