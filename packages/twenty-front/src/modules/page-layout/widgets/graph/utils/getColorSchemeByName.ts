import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export const getColorSchemeByName = (
  registry: GraphColorRegistry,
  name: string,
): GraphColorScheme | undefined => {
  return registry[name];
};
