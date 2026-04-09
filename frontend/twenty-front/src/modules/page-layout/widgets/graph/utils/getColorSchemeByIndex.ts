import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export const getColorSchemeByIndex = (
  registry: GraphColorRegistry,
  index: number,
): GraphColorScheme => {
  const schemes = Object.values(registry);
  return schemes[index % schemes.length];
};
