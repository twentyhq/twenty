import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { TEXT_MARGIN_LIMITS } from '@/page-layout/widgets/graph/constants/TextMarginLimits';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { measureTextDimensions } from '@/page-layout/widgets/graph/utils/measureTextDimensions';
import { isNumber } from '@sniptt/guards';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getMaxLabelDimensions = ({
  labels,
  fontSize,
  fontFamily,
}: {
  labels?: string[];
  fontSize: number;
  fontFamily?: string;
}) =>
  (labels ?? []).reduce(
    (maxDimensions, label) => {
      const { width, height } = measureTextDimensions({
        text: label,
        fontSize,
        fontFamily,
      });

      return {
        width: Math.max(maxDimensions.width, width),
        height: Math.max(maxDimensions.height, height),
      };
    },
    { width: 0, height: 0 },
  );

const estimateRotatedLabelHeight = ({
  width,
  height,
  rotationDegrees,
}: {
  width: number;
  height: number;
  rotationDegrees: number;
}) => {
  if (rotationDegrees === 0 || width === 0) {
    return 0;
  }

  const rotationRadians = (Math.abs(rotationDegrees) * Math.PI) / 180;
  const projectedHeight =
    Math.abs(width * Math.sin(rotationRadians)) +
    Math.abs(height * Math.cos(rotationRadians));

  return Math.max(height, projectedHeight);
};

export const getChartMarginsFromText = ({
  tickFontSize,
  legendFontSize,
  fontFamily,
  bottomTickLabels,
  leftTickLabels,
  xAxisLabel,
  yAxisLabel,
  tickRotation,
  bottomLegendOffset,
}: {
  tickFontSize: number;
  legendFontSize?: number;
  fontFamily?: string;
  bottomTickLabels?: string[];
  leftTickLabels?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  tickRotation: number;
  bottomLegendOffset?: number;
}): ChartMargins => {
  const normalizedLegendFontSize = legendFontSize ?? tickFontSize;

  const bottomTickDimensions = getMaxLabelDimensions({
    labels: bottomTickLabels,
    fontSize: tickFontSize,
    fontFamily,
  });
  const leftTickDimensions = getMaxLabelDimensions({
    labels: leftTickLabels,
    fontSize: tickFontSize,
    fontFamily,
  });

  const bottomAxisLabelDimensions = xAxisLabel
    ? measureTextDimensions({
        text: xAxisLabel,
        fontSize: normalizedLegendFontSize,
        fontFamily,
      })
    : { width: 0, height: 0 };
  const leftAxisLabelDimensions = yAxisLabel
    ? measureTextDimensions({
        text: yAxisLabel,
        fontSize: normalizedLegendFontSize,
        fontFamily,
      })
    : { width: 0, height: 0 };

  const hasBottomTicks = bottomTickDimensions.height > 0;
  const bottomTickHeight =
    tickRotation !== 0
      ? estimateRotatedLabelHeight({
          width: bottomTickDimensions.width,
          height: bottomTickDimensions.height,
          rotationDegrees: tickRotation,
        })
      : bottomTickDimensions.height;
  const bottomTicksBlock = hasBottomTicks
    ? bottomTickHeight +
      COMMON_CHART_CONSTANTS.TICK_PADDING +
      TEXT_MARGIN_EXTRAS.tickPaddingExtra
    : 0;
  const bottomLabelBlock = bottomAxisLabelDimensions.height
    ? bottomAxisLabelDimensions.height + TEXT_MARGIN_EXTRAS.tickPaddingExtra
    : 0;
  const bottomFromTicksAndLabel = bottomTicksBlock + bottomLabelBlock;
  const bottomFromLegendOffset =
    xAxisLabel && isNumber(bottomLegendOffset)
      ? bottomLegendOffset +
        bottomAxisLabelDimensions.height +
        TEXT_MARGIN_EXTRAS.tickPaddingExtra
      : 0;

  const bottom = clamp(
    Math.ceil(Math.max(bottomFromTicksAndLabel, bottomFromLegendOffset)),
    TEXT_MARGIN_LIMITS.min.bottom,
    TEXT_MARGIN_LIMITS.max.bottom,
  );

  const hasLeftTicks = leftTickDimensions.width > 0;
  const leftTicksBlock = hasLeftTicks
    ? leftTickDimensions.width +
      COMMON_CHART_CONSTANTS.TICK_PADDING +
      TEXT_MARGIN_EXTRAS.tickPaddingExtra
    : 0;
  const leftLabelBlock = leftAxisLabelDimensions.height
    ? leftAxisLabelDimensions.height + TEXT_MARGIN_EXTRAS.tickPaddingExtra
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
