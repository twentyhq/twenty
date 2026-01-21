import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { measureTextDimensions } from '@/page-layout/widgets/graph/utils/measureTextDimensions';

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
