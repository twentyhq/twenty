import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { hashColorKey } from '@/page-layout/widgets/graph/utils/hashColorKey';
import { isDefined } from 'twenty-shared/utils';

export const getColorScheme = ({
  registry,
  colorName,
  colorKey,
  groupIndex,
  totalGroups,
}: {
  registry: GraphColorRegistry;
  colorName?: GraphColor;
  colorKey: string;
  groupIndex?: number;
  totalGroups?: number;
}): GraphColorScheme => {
  const normalizedColorName = isDefined(colorName)
    ? (colorName.toLowerCase() as GraphColor)
    : undefined;

  if (
    !isDefined(normalizedColorName) ||
    !isDefined(registry[normalizedColorName])
  ) {
    return getColorSchemeByIndex(registry, hashColorKey(colorKey));
  }

  if (!isDefined(totalGroups)) {
    return registry[normalizedColorName];
  }

  if (!isDefined(groupIndex)) {
    throw new Error(
      `Missing groupIndex for color key "${colorKey}" while totalGroups is set`,
    );
  }

  return {
    ...registry[normalizedColorName],
    solid: generateGroupColor({
      colorScheme: registry[normalizedColorName],
      groupIndex,
      totalGroups,
    }),
  };
};
