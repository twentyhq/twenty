import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { estimateLineHeight } from '@/page-layout/widgets/graph/utils/estimateLineHeight';

export const estimateRotatedHeight = (
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
