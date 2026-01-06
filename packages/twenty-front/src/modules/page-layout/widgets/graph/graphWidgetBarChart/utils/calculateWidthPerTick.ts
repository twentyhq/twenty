import { BarChartLayout } from '~/generated/graphql';

export const calculateWidthPerTick = ({
  layout,
  availableWidth,
  categoryTickCount,
  valueTickCount,
}: {
  layout: BarChartLayout;
  availableWidth: number;
  categoryTickCount: number;
  valueTickCount: number;
}): number => {
  if (layout === BarChartLayout.VERTICAL) {
    return categoryTickCount > 0 ? availableWidth / categoryTickCount : 0;
  }

  return valueTickCount > 0 ? availableWidth / valueTickCount : 0;
};
