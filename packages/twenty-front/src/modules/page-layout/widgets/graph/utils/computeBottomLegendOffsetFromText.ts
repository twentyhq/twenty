import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { estimateRotatedLabelHeight } from '@/page-layout/widgets/graph/utils/estimateRotatedLabelHeight';
import { getMaxLabelDimensions } from '@/page-layout/widgets/graph/utils/getMaxLabelDimensions';

export const computeBottomLegendOffsetFromText = ({
  tickLabels,
  tickFontSize,
  fontFamily,
  tickRotation,
}: {
  tickLabels?: string[];
  tickFontSize: number;
  fontFamily?: string;
  tickRotation: number;
}) => {
  if (!tickLabels || tickLabels.length === 0) {
    const extraSpacing =
      tickRotation === 0
        ? TEXT_MARGIN_EXTRAS.bottomTickExtraNonRotated
        : TEXT_MARGIN_EXTRAS.bottomTickExtraRotated;
    return Math.ceil(
      tickFontSize +
        COMMON_CHART_CONSTANTS.TICK_PADDING +
        TEXT_MARGIN_EXTRAS.tickPaddingExtra +
        extraSpacing,
    );
  }

  const bottomTickDimensions = getMaxLabelDimensions({
    labels: tickLabels,
    fontSize: tickFontSize,
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
    bottomTickHeight > 0 ? bottomTickHeight : tickFontSize;
  const extraSpacing =
    tickRotation === 0
      ? TEXT_MARGIN_EXTRAS.bottomTickExtraNonRotated
      : TEXT_MARGIN_EXTRAS.bottomTickExtraRotated;

  return Math.ceil(
    effectiveTickHeight +
      COMMON_CHART_CONSTANTS.TICK_PADDING +
      TEXT_MARGIN_EXTRAS.tickPaddingExtra +
      extraSpacing,
  );
};
