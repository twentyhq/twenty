import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { TEXT_MARGIN_LIMITS } from '@/page-layout/widgets/graph/constants/TextMarginLimits';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { estimateLineHeight } from '@/page-layout/widgets/graph/utils/estimateLineHeight';
import { estimateRotatedHeight } from '@/page-layout/widgets/graph/utils/estimateRotatedHeight';
import { getMaxLabelLength } from '@/page-layout/widgets/graph/utils/getMaxLabelLength';
import { isNumber } from '@sniptt/guards';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const estimateLabelWidth = (maxLength: number, fontSize: number) =>
  Math.ceil(
    maxLength *
      fontSize *
      COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO,
  );

export const getChartMarginsFromText = ({
  tickFontSize,
  legendFontSize,
  bottomTickLabels,
  leftTickLabels,
  xAxisLabel,
  yAxisLabel,
  tickRotation,
  bottomLegendOffset,
}: {
  tickFontSize: number;
  legendFontSize?: number;
  bottomTickLabels?: string[];
  leftTickLabels?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  tickRotation: number;
  bottomLegendOffset?: number;
}): ChartMargins => {
  const normalizedLegendFontSize = legendFontSize ?? tickFontSize;

  const bottomMaxLabelLength = getMaxLabelLength(bottomTickLabels);
  const leftMaxLabelLength = getMaxLabelLength(leftTickLabels);

  const tickPaddingExtra = xAxisLabel ? TEXT_MARGIN_EXTRAS.tickPaddingExtra : 0;
  const bottomTickHeight =
    bottomMaxLabelLength > 0
      ? tickRotation !== 0
        ? estimateRotatedHeight(
            bottomMaxLabelLength,
            tickFontSize,
            tickRotation,
          )
        : estimateLineHeight(tickFontSize)
      : 0;
  const bottomTicksBlock =
    bottomTickHeight > 0
      ? bottomTickHeight +
        COMMON_CHART_CONSTANTS.TICK_PADDING +
        tickPaddingExtra
      : 0;
  const bottomLabelBlock = xAxisLabel
    ? normalizedLegendFontSize + tickPaddingExtra
    : 0;
  const bottomFromTicksAndLabel = bottomTicksBlock + bottomLabelBlock;
  const bottomFromLegendOffset =
    xAxisLabel && isNumber(bottomLegendOffset)
      ? bottomLegendOffset + normalizedLegendFontSize + tickPaddingExtra
      : 0;

  const bottom = clamp(
    Math.ceil(Math.max(bottomFromTicksAndLabel, bottomFromLegendOffset)),
    TEXT_MARGIN_LIMITS.min.bottom,
    TEXT_MARGIN_LIMITS.max.bottom,
  );

  const leftTickWidth =
    leftMaxLabelLength > 0
      ? estimateLabelWidth(leftMaxLabelLength, tickFontSize)
      : 0;
  const leftTicksBlock =
    leftTickWidth > 0
      ? leftTickWidth +
        COMMON_CHART_CONSTANTS.TICK_PADDING +
        TEXT_MARGIN_EXTRAS.tickPaddingExtra
      : 0;
  const leftLabelBlock = yAxisLabel
    ? normalizedLegendFontSize + TEXT_MARGIN_EXTRAS.tickPaddingExtra
    : 0;
  const left = clamp(
    Math.ceil(leftTicksBlock + leftLabelBlock),
    TEXT_MARGIN_LIMITS.min.left,
    TEXT_MARGIN_LIMITS.max.left,
  );

  const topRightBase = Math.ceil(tickFontSize * 1.5);

  return {
    top: clamp(
      topRightBase,
      TEXT_MARGIN_LIMITS.min.top,
      TEXT_MARGIN_LIMITS.max.top,
    ),
    right: clamp(
      topRightBase,
      TEXT_MARGIN_LIMITS.min.right,
      TEXT_MARGIN_LIMITS.max.right,
    ),
    bottom,
    left,
  };
};
