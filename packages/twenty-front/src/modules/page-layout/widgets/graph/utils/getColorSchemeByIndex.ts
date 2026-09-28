import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const getColorSchemeByIndex = (
  registry: GraphColorRegistry,
  index: number,
): GraphColorScheme => {
  const schemes = Object.values(registry);
  const colorScheme = schemes[index % schemes.length];

  assertIsDefinedOrThrow(
    colorScheme,
    new Error('Graph color registry is empty'),
  );

  return colorScheme;
};
