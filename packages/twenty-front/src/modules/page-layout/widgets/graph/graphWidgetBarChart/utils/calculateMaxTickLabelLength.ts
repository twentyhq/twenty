const AVERAGE_CHARACTER_WIDTH_RATIO = 0.6;
const MIN_TICK_LABEL_LENGTH = 5;

export const calculateMaxTickLabelLength = ({
  widthPerTick,
  axisFontSize,
}: {
  widthPerTick: number;
  axisFontSize: number;
}): number => {
  const averageCharacterWidth = axisFontSize * AVERAGE_CHARACTER_WIDTH_RATIO;
  const calculatedLength = Math.floor(widthPerTick / averageCharacterWidth);

  return Math.max(MIN_TICK_LABEL_LENGTH, calculatedLength);
};
