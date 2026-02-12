import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { isDefined } from 'twenty-shared/utils';

export const getColorScheme = ({
  registry,
  colorName,
  fallbackIndex,
  totalGroups,
}: {
  registry: GraphColorRegistry;
  colorName?: GraphColor;
  fallbackIndex?: number;
  totalGroups?: number;
}): GraphColorScheme => {
  const normalizedColorName = isDefined(colorName)
    ? (colorName.toLowerCase() as GraphColor)
    : undefined;

  if (
    !isDefined(normalizedColorName) ||
    !isDefined(registry[normalizedColorName])
  ) {
    return getColorSchemeByIndex(registry, fallbackIndex ?? 0);
  }

  if (!isDefined(totalGroups)) {
    return registry[normalizedColorName];
  }

  return {
    ...registry[normalizedColorName],
    solid: generateGroupColor({
      colorScheme: registry[normalizedColorName],
      groupIndex: fallbackIndex ?? 0,
      totalGroups,
    }),
  };
};
