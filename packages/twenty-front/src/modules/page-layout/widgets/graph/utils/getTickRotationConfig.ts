import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';

const TICK_ROTATION_ANGLE_RAD =
  (Math.abs(COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE) * Math.PI) / 180;
const MIN_CALCULATED_LENGTH = 1;
const TICK_MARGIN = 1;

export type TickRotationConfig = {
  tickRotation: number;
  maxLabelLength: number;
};

export const getTickRotationConfig = ({
  widthPerTick,
  axisFontSize,
}: {
  widthPerTick: number;
  axisFontSize: number;
}): TickRotationConfig => {
  const shouldRotate =
    widthPerTick <
    COMMON_CHART_CONSTANTS.TICK_MINIMUM_NUMBER_OF_DISPLAYED_CHARACTERS *
      COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO *
      axisFontSize +
      TICK_MARGIN;

  if (shouldRotate) {
    const characterWidth =
      axisFontSize * COMMON_CHART_CONSTANTS.ROTATED_LABEL_CHARACTER_WIDTH_RATIO;
    const calculatedLength = Math.max(
      MIN_CALCULATED_LENGTH,
      Math.floor(
        COMMON_CHART_CONSTANTS.MARGIN_BOTTOM_WITHOUT_LABEL /
          (characterWidth * Math.sin(TICK_ROTATION_ANGLE_RAD)),
      ),
    );

    return {
      tickRotation: COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE,
      maxLabelLength: calculatedLength,
    };
  }

  const characterWidth =
    axisFontSize *
    COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;

  const calculatedLength = Math.max(
    MIN_CALCULATED_LENGTH,
    Math.floor(widthPerTick / characterWidth),
  );

  return {
    tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    maxLabelLength: calculatedLength,
  };
};
