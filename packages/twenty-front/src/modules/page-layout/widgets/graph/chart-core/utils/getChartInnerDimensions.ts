import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';

type GetChartInnerDimensionsParams = {
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
};

type ChartInnerDimensions = {
  innerWidth: number;
  innerHeight: number;
};

export const getChartInnerDimensions = ({
  chartWidth,
  chartHeight,
  margins,
}: GetChartInnerDimensionsParams): ChartInnerDimensions => {
  return {
    innerWidth: chartWidth - margins.left - margins.right,
    innerHeight: chartHeight - margins.top - margins.bottom,
  };
};
