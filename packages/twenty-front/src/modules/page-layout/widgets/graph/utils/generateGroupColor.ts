import { GRAPH_COLOR_SCALE_MAX } from '@/page-layout/widgets/graph/constants/GraphColorScaleMax';
import { GRAPH_COLOR_SCALE_MIN } from '@/page-layout/widgets/graph/constants/GraphColorScaleMinIndex';
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

  const colorIndexRange = GRAPH_COLOR_SCALE_MAX - GRAPH_COLOR_SCALE_MIN;

  const variationIndex =
    GRAPH_COLOR_SCALE_MIN -
    1 +
    Math.floor(
      ((effectiveGroupIndex + 1) / effectiveTotalGroups) * colorIndexRange,
    );

  return colorScheme.variations[variationIndex];
};
