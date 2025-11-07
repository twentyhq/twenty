export const calculateWidthPerTick = ({
  layout,
  availableWidth,
  categoryTickCount,
  valueTickCount,
}: {
  layout: 'vertical' | 'horizontal';
  availableWidth: number;
  categoryTickCount: number;
  valueTickCount: number;
}): number => {
  if (layout === 'vertical') {
    return categoryTickCount > 0 ? availableWidth / categoryTickCount : 0;
  }

  return valueTickCount > 0 ? availableWidth / valueTickCount : 0;
};
