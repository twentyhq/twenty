import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { estimateLineHeight } from '@/page-layout/widgets/graph/utils/estimateLineHeight';
import { estimateRotatedHeight } from '@/page-layout/widgets/graph/utils/estimateRotatedHeight';
import { getMaxLabelLength } from '@/page-layout/widgets/graph/utils/getMaxLabelLength';

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
