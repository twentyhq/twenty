import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { isDefined } from 'twenty-shared/utils';
import { type GraphColor } from '../types/GraphColor';
import { type GraphColorRegistry } from '../types/GraphColorRegistry';
import { type GraphColorScheme } from '../types/GraphColorScheme';

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
  if (!isDefined(colorName) || !isDefined(registry[colorName])) {
    return getColorSchemeByIndex(registry, fallbackIndex ?? 0);
  }

  if (!isDefined(totalGroups)) {
    return registry[colorName];
  }

  return {
    ...registry[colorName],
    solid: generateGroupColor({
      colorScheme: registry[colorName],
      groupIndex: fallbackIndex ?? 0,
      totalGroups,
    }),
  };
};
