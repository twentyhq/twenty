import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';
import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import {
  type BarChartLayout,
  BarChartLayout as BarChartLayoutEnum,
} from '~/generated-metadata/graphql';

export type BarPositionContext = {
  isVertical: boolean;
  dataLength: number;
  keysLength: number;
  categoryStep: number;
  categoryWidth: number;
  outerPadding: number;
  valueAxisLength: number;
  valueToPixel: (value: number) => number;
  zeroPixel: number;
};

type ComputeBarPositionContextParams = {
  data: BarChartDatum[];
  keys: string[];
  innerWidth: number;
  innerHeight: number;
  layout: BarChartLayout;
  valueDomain: { min: number; max: number };
};

export const computeBarPositionContext = ({
  data,
  keys,
  innerWidth,
  innerHeight,
  layout,
  valueDomain,
}: ComputeBarPositionContextParams): BarPositionContext | null => {
  const dataLength = data.length;
  const keysLength = keys.length;
  const isVertical = layout === BarChartLayoutEnum.VERTICAL;

  if (dataLength === 0 || keysLength === 0) {
    return null;
  }

  const categoryAxisLength = isVertical ? innerWidth : innerHeight;
  const valueAxisLength = isVertical ? innerHeight : innerWidth;

  const { step, bandwidth, offset } = computeBandScale({
    axisLength: categoryAxisLength,
    count: dataLength,
    padding: BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO,
    outerPaddingPx: BAR_CHART_CONSTANTS.OUTER_PADDING_PX,
  });

  const { valueToPixel } = computeValueScale({
    domain: valueDomain,
    axisLength: valueAxisLength,
  });

  return {
    isVertical,
    dataLength,
    keysLength,
    categoryStep: step,
    categoryWidth: bandwidth,
    outerPadding: offset,
    valueAxisLength,
    valueToPixel,
    zeroPixel: valueToPixel(0),
  };
};
