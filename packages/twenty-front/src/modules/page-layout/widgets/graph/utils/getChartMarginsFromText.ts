import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { measureTextDimensions } from '@/page-layout/widgets/graph/utils/measureText';
import { parseFontSizeToPx } from '@/page-layout/widgets/graph/utils/parseFontSize';

export type ChartMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const PADDING_EXTRA = 4;
const NON_ROTATED_TICK_EXTRA = 20;
const ROTATED_TICK_EXTRA = 8;

const MARGIN_LIMITS = {
  min: { top: 10, right: 10, bottom: 30, left: 40 },
  max: { top: 30, right: 30, bottom: 140, left: 160 },
} as const;

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

export const computeBottomLegendOffsetFromText = ({
  tickLabels,
  tickFontSize,
  fontFamily,
  tickRotation,
}: {
  tickLabels?: string[];
  tickFontSize: number | string;
  fontFamily?: string;
  tickRotation: number;
}) => {
  const normalizedTickFontSize = parseFontSizeToPx(
    tickFontSize,
    COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE,
  );

  if (!tickLabels || tickLabels.length === 0) {
    const extraSpacing =
      tickRotation === 0 ? NON_ROTATED_TICK_EXTRA : ROTATED_TICK_EXTRA;
    return Math.ceil(
      normalizedTickFontSize +
        COMMON_CHART_CONSTANTS.TICK_PADDING +
        PADDING_EXTRA +
        extraSpacing,
    );
  }

  const bottomTickDimensions = getMaxLabelDimensions({
    labels: tickLabels,
    fontSize: normalizedTickFontSize,
    fontFamily,
  });
  const bottomTickHeight =
    tickRotation !== 0
      ? estimateRotatedLabelHeight({
          width: bottomTickDimensions.width,
          height: bottomTickDimensions.height,
          rotationDegrees: tickRotation,
        })
      : bottomTickDimensions.height;
  const effectiveTickHeight =
    bottomTickHeight > 0 ? bottomTickHeight : normalizedTickFontSize;
  const extraSpacing =
    tickRotation === 0 ? NON_ROTATED_TICK_EXTRA : ROTATED_TICK_EXTRA;

  return Math.ceil(
    effectiveTickHeight +
      COMMON_CHART_CONSTANTS.TICK_PADDING +
      PADDING_EXTRA +
      extraSpacing,
  );
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
  tickFontSize: number | string;
  legendFontSize?: number | string;
  fontFamily?: string;
  bottomTickLabels?: string[];
  leftTickLabels?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  tickRotation: number;
  bottomLegendOffset?: number;
}): ChartMargins => {
  const normalizedTickFontSize = parseFontSizeToPx(
    tickFontSize,
    COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE,
  );
  const normalizedLegendFontSize = parseFontSizeToPx(
    legendFontSize ?? tickFontSize,
    normalizedTickFontSize,
  );

  const bottomTickDimensions = getMaxLabelDimensions({
    labels: bottomTickLabels,
    fontSize: normalizedTickFontSize,
    fontFamily,
  });
  const leftTickDimensions = getMaxLabelDimensions({
    labels: leftTickLabels,
    fontSize: normalizedTickFontSize,
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
    ? bottomTickHeight + COMMON_CHART_CONSTANTS.TICK_PADDING + PADDING_EXTRA
    : 0;
  const bottomLabelBlock = bottomAxisLabelDimensions.height
    ? bottomAxisLabelDimensions.height + PADDING_EXTRA
    : 0;
  const bottomFromTicksAndLabel = bottomTicksBlock + bottomLabelBlock;
  const bottomFromLegendOffset =
    xAxisLabel && typeof bottomLegendOffset === 'number'
      ? bottomLegendOffset + bottomAxisLabelDimensions.height + PADDING_EXTRA
      : 0;

  const bottom = clamp(
    Math.ceil(Math.max(bottomFromTicksAndLabel, bottomFromLegendOffset)),
    MARGIN_LIMITS.min.bottom,
    MARGIN_LIMITS.max.bottom,
  );

  const hasLeftTicks = leftTickDimensions.width > 0;
  const leftTicksBlock = hasLeftTicks
    ? leftTickDimensions.width +
      COMMON_CHART_CONSTANTS.TICK_PADDING +
      PADDING_EXTRA
    : 0;
  const leftLabelBlock = leftAxisLabelDimensions.height
    ? leftAxisLabelDimensions.height + PADDING_EXTRA
    : 0;
  const left = clamp(
    Math.ceil(leftTicksBlock + leftLabelBlock),
    MARGIN_LIMITS.min.left,
    MARGIN_LIMITS.max.left,
  );

  const topRightBase = Math.ceil(normalizedTickFontSize * 1.5);

  return {
    top: clamp(topRightBase, MARGIN_LIMITS.min.top, MARGIN_LIMITS.max.top),
    right: clamp(
      topRightBase,
      MARGIN_LIMITS.min.right,
      MARGIN_LIMITS.max.right,
    ),
    bottom,
    left,
  };
};
