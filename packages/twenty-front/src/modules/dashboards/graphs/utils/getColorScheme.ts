import { isDefined } from 'twenty-shared/utils';
import { type GraphColor } from '../types/GraphColor';
import { type GraphColorRegistry } from '../types/GraphColorRegistry';
import { type GraphColorScheme } from '../types/GraphColorScheme';
import { getColorSchemeByIndex } from './getColorSchemeByIndex';

export const getColorScheme = (
  registry: GraphColorRegistry,
  colorName?: GraphColor,
  fallbackIndex?: number,
): GraphColorScheme => {
  if (isDefined(colorName) && isDefined(registry[colorName])) {
    return registry[colorName];
  }
  return getColorSchemeByIndex(registry, fallbackIndex || 0);
};
