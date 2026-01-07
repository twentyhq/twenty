import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { isDefined } from 'twenty-shared/utils';

export const checkIsExplicitColorSelection = (
  colors: (GraphColor | undefined)[],
): boolean => {
  const firstColor = colors[0];

  return isDefined(firstColor) && colors.every((color) => color === firstColor);
};
