import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { getMaxLabelLength } from '@/page-layout/widgets/graph/utils/getMaxLabelLength';

const estimateLineHeight = (fontSize: number) =>
  Math.ceil(fontSize * COMMON_CHART_CONSTANTS.TICK_LABEL_LINE_HEIGHT_RATIO);

const estimateRotatedHeight = (
  maxLength: number,
  fontSize: number,
  rotationDegrees: number,
) => {
  if (rotationDegrees === 0 || maxLength <= 0) {
    return 0;
  }

  const labelWidth =
    maxLength *
    fontSize *
    COMMON_CHART_CONSTANTS.ROTATED_TICK_LABEL_WIDTH_ESTIMATE_RATIO;
  if (labelWidth <= 0) {
    return 0;
  }

  const labelHeight = estimateLineHeight(fontSize);
  const rotationRadians = (Math.abs(rotationDegrees) * Math.PI) / 180;
  const projectedHeight =
    Math.abs(labelWidth * Math.sin(rotationRadians)) +
    Math.abs(labelHeight * Math.cos(rotationRadians));

  return Math.max(labelHeight, projectedHeight);
};

export const computeBottomLegendOffsetFromText = ({
  tickLabels,
  tickFontSize,
  tickRotation,
}: {
  tickLabels?: string[];
  tickFontSize: number;
  tickRotation: number;
}) => {
  if (!tickLabels || tickLabels.length === 0) {
    const extraSpacing =
      tickRotation === 0 ? TEXT_MARGIN_EXTRAS.bottomTickExtraNonRotated : 0;
    return Math.ceil(
      tickFontSize +
        COMMON_CHART_CONSTANTS.TICK_PADDING +
        TEXT_MARGIN_EXTRAS.tickPaddingExtra +
        extraSpacing,
    );
  }

  const effectiveMaxLabelLength = getMaxLabelLength(tickLabels);
  const bottomTickHeight =
    tickRotation !== 0
      ? estimateRotatedHeight(
          effectiveMaxLabelLength,
          tickFontSize,
          tickRotation,
        )
      : estimateLineHeight(tickFontSize);
  const effectiveTickHeight =
    bottomTickHeight > 0 ? bottomTickHeight : tickFontSize;
  const extraSpacing =
    tickRotation === 0 ? TEXT_MARGIN_EXTRAS.bottomTickExtraNonRotated : 0;

  return Math.ceil(
    effectiveTickHeight +
      COMMON_CHART_CONSTANTS.TICK_PADDING +
      TEXT_MARGIN_EXTRAS.tickPaddingExtra +
      extraSpacing,
  );
};
