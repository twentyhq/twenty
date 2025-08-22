import { type GraphColorRegistry } from '../types/GraphColorRegistry';
import { type GraphColorScheme } from '../types/GraphColorScheme';

export const getColorSchemeByName = (
  registry: GraphColorRegistry,
  name: string,
): GraphColorScheme | undefined => {
  return registry[name];
};
