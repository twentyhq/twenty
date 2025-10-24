import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { isDefined } from 'twenty-shared/utils';
import { type GraphColor } from '../types/GraphColor';
import { type GraphColorRegistry } from '../types/GraphColorRegistry';
import { type GraphColorScheme } from '../types/GraphColorScheme';
import { getColorSchemeByIndex } from './getColorSchemeByIndex';

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
  if (
    isDefined(colorName) &&
    colorName !== 'auto' &&
    isDefined(registry[colorName]) &&
    isDefined(totalGroups)
  ) {
    return {
      ...registry[colorName],
      solid: generateGroupColor(
        registry[colorName].solid,
        fallbackIndex ?? 0,
        totalGroups,
      ),
    };
  }

  return getColorSchemeByIndex(registry, fallbackIndex ?? 0);
};
