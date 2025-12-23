import { type GraphColorRegistry } from '@/modules/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/modules/page-layout/widgets/graph/types/GraphColorScheme';

export const getColorSchemeByName = (
  registry: GraphColorRegistry,
  name: string,
): GraphColorScheme | undefined => {
  return registry[name];
};
