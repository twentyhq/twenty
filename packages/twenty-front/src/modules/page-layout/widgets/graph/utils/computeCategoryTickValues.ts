const MINIMUM_WIDTH_PER_TICK = 100;

export const computeCategoryTickValues = ({
  width,
  values,
  leftMargin,
  rightMargin,
}: {
  width: number;
  values: (string | number)[];
  leftMargin: number;
  rightMargin: number;
}): (string | number)[] => {
  if (width === 0 || values.length === 0) return [];

  const horizontalMargins = leftMargin + rightMargin;
  const availableWidth = width - horizontalMargins;
  const numberOfTicks = Math.floor(availableWidth / MINIMUM_WIDTH_PER_TICK);

  if (numberOfTicks <= 0) return [];
  if (numberOfTicks === 1) return [values[0]];
  if (numberOfTicks >= values.length) return values;

  const step = (values.length - 1) / (numberOfTicks - 1);

  return Array.from({ length: numberOfTicks }, (_, i) => {
    const index = Math.min(Math.round(i * step), values.length - 1);
    return values[index];
  });
};
