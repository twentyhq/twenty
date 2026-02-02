import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { isDefined } from 'twenty-shared/utils';

export const computeAllCategorySlices = ({
  data,
  indexBy,
  bars,
  isVerticalLayout,
  chartWidth,
  chartHeight,
  margins,
}: {
  data: BarChartDatum[];
  indexBy: string;
  bars: BarPosition[];
  isVerticalLayout: boolean;
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
}): BarChartSlice[] => {
  if (data.length === 0) {
    return [];
  }

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;
  const categoryAxisLength = isVerticalLayout ? innerWidth : innerHeight;
  const dataLength = data.length;

  const {
    step: categoryStep,
    bandwidth: categoryWidth,
    offset: outerPadding,
  } = computeBandScale({
    axisLength: categoryAxisLength,
    count: dataLength,
    padding: BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO,
    outerPaddingPx: BAR_CHART_CONSTANTS.OUTER_PADDING_PX,
  });

  const barsByIndexValue = new Map<string, BarPosition[]>();
  for (const bar of bars) {
    const existingBars = barsByIndexValue.get(bar.indexValue);
    if (isDefined(existingBars)) {
      existingBars.push(bar);
    } else {
      barsByIndexValue.set(bar.indexValue, [bar]);
    }
  }

  const slices: BarChartSlice[] = [];

  for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
    const dataPoint = data[dataIndex];
    const indexValue = String(dataPoint[indexBy]);

    const effectiveIndex = isVerticalLayout
      ? dataIndex
      : dataLength - 1 - dataIndex;
    const categoryStart = outerPadding + effectiveIndex * categoryStep;
    const sliceLeft = categoryStart;
    const sliceRight = categoryStart + categoryWidth;
    const sliceCenter = (sliceLeft + sliceRight) / 2;

    const barsForCategory = barsByIndexValue.get(indexValue) ?? [];

    slices.push({
      indexValue,
      bars: barsForCategory,
      sliceLeft,
      sliceRight,
      sliceCenter,
    });
  }

  return slices;
};
