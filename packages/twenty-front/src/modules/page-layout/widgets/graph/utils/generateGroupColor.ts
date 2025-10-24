import { RGBA } from 'twenty-ui/theme';

import { GRAPH_GROUP_COLOR_MINIMUM_ALPHA } from '@/page-layout/widgets/graph/constants/GraphGroupColorMinimumAlpha.constant';

export const generateGroupColor = (
  baseColor: string,
  groupIndex: number,
  totalGroups: number,
): string => {
  if (totalGroups <= 1) {
    return baseColor;
  }

  const ratio = (groupIndex + 1) / totalGroups;
  const alpha =
    GRAPH_GROUP_COLOR_MINIMUM_ALPHA +
    (1 - GRAPH_GROUP_COLOR_MINIMUM_ALPHA) * ratio;

  return RGBA(baseColor, alpha);
};
