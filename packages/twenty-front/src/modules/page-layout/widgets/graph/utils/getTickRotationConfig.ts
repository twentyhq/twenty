import { ROTATION_THRESHOLD_WIDTH } from '@/page-layout/widgets/graph/constants/RotationThresholdWidth';
import { NO_ROTATION_ANGLE } from '@/page-layout/widgets/graph/utils/noRotationAngle';

const ROTATED_LABEL_CHARACTER_WIDTH_RATIO = 0.5;
const HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO = 0.6;

const MIN_LABEL_LENGTH = 13;
const MAX_ROTATED_LABEL_LENGTH = 25;
const MAX_HORIZONTAL_LABEL_LENGTH = 30;

const TICK_ROTATION_ANGLE = -45;
const MIN_CALCULATED_LENGTH = 1;

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
  const shouldRotate = widthPerTick < ROTATION_THRESHOLD_WIDTH;

  if (shouldRotate) {
    const rotatedWidthPerTick = widthPerTick * Math.cos(TICK_ROTATION_ANGLE);
    const characterWidth = axisFontSize * ROTATED_LABEL_CHARACTER_WIDTH_RATIO;
    const calculatedLength = Math.max(
      MIN_CALCULATED_LENGTH,
      Math.floor(rotatedWidthPerTick / characterWidth),
    );

    return {
      tickRotation: TICK_ROTATION_ANGLE,
      maxLabelLength: Math.min(
        MAX_ROTATED_LABEL_LENGTH,
        Math.max(MIN_LABEL_LENGTH, calculatedLength),
      ),
    };
  }

  const characterWidth = axisFontSize * HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;
  const calculatedLength = Math.max(
    MIN_CALCULATED_LENGTH,
    Math.floor(widthPerTick / characterWidth),
  );

  return {
    tickRotation: NO_ROTATION_ANGLE,
    maxLabelLength: Math.min(
      MAX_HORIZONTAL_LABEL_LENGTH,
      Math.max(MIN_LABEL_LENGTH, calculatedLength),
    ),
  };
};
