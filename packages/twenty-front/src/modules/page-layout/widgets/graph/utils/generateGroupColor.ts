import { RGBA } from 'twenty-ui/theme';

import { GRAPH_GROUP_COLOR_MINIMUM_ALPHA } from '@/page-layout/widgets/graph/constants/GraphGroupColorMinimumAlpha.constant';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUP_COLORS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroupColors';

export const generateGroupColor = (
  baseColor: string,
  groupIndex: number,
  totalGroups: number,
): string => {
  if (totalGroups <= 1) {
    return baseColor;
  }

  const effectiveGroupIndex = groupIndex % GRAPH_MAXIMUM_NUMBER_OF_GROUP_COLORS;
  const effectiveTotalGroups = Math.min(
    totalGroups,
    GRAPH_MAXIMUM_NUMBER_OF_GROUP_COLORS,
  );

  const ratio = (effectiveGroupIndex + 1) / effectiveTotalGroups;
  const alpha =
    GRAPH_GROUP_COLOR_MINIMUM_ALPHA +
    (1 - GRAPH_GROUP_COLOR_MINIMUM_ALPHA) * ratio;

  return RGBA(baseColor, alpha);
};
