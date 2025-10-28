import { type GraphColorRegistry } from '../types/GraphColorRegistry';
import { type GraphColorScheme } from '../types/GraphColorScheme';

export const getColorSchemeByIndex = (
  registry: GraphColorRegistry,
  index: number,
): GraphColorScheme => {
  const schemes = Object.values(registry);
  return schemes[index % schemes.length];
};
