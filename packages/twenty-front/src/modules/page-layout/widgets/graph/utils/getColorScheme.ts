import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

export const getColorScheme = ({
  registry,
  colorName,
  colorKey,
  colorMode,
  alphabeticalRankByKey,
}: {
  registry: GraphColorRegistry;
  colorName?: GraphColor;
  colorKey: string;
  colorMode: GraphColorMode;
  alphabeticalRankByKey: ReadonlyMap<string, number>;
}): GraphColorScheme => {
  const alphabeticalRank = alphabeticalRankByKey.get(colorKey);

  assertIsDefinedOrThrow(
    alphabeticalRank,
    new Error(`Missing alphabetical rank for color key "${colorKey}"`),
  );

  const normalizedColorName = isDefined(colorName)
    ? (colorName.toLowerCase() as GraphColor)
    : undefined;

  if (
    !isDefined(normalizedColorName) ||
    !isDefined(registry[normalizedColorName])
  ) {
    return getColorSchemeByIndex(registry, alphabeticalRank);
  }

  if (colorMode !== 'explicitSingleColor') {
    return registry[normalizedColorName];
  }

  return {
    ...registry[normalizedColorName],
    solid: generateGroupColor({
      colorScheme: registry[normalizedColorName],
      groupIndex: alphabeticalRank,
      totalGroups: alphabeticalRankByKey.size,
    }),
  };
};
