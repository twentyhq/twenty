import { RGBA } from 'twenty-ui/theme';

import { GRAPH_GROUP_COLOR_MINIMUM_ALPHA } from '@/page-layout/widgets/graph/constants/GraphGroupColorMinimumAlpha.constant';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUP_COLORS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroupColors';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export const generateGroupColor = ({
  colorScheme,
  groupIndex,
  totalGroups,
}: {
  colorScheme: GraphColorScheme;
  groupIndex: number;
  totalGroups: number;
}): string => {
  if (totalGroups <= 1) {
    return colorScheme.solid;
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

  return RGBA(colorScheme.solid, alpha);
};
