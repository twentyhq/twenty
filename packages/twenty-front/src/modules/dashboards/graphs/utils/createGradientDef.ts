import { type GraphColorScheme } from '../types/GraphColorScheme';

export const createGradientDef = (
  colorScheme: GraphColorScheme,
  id: string,
  isHovered: boolean = false,
) => {
  const colors = isHovered
    ? colorScheme.gradient.hover
    : colorScheme.gradient.normal;
  return {
    id,
    type: 'linearGradient' as const,
    colors: [
      { offset: 0, color: colors[0] },
      { offset: 100, color: colors[1] },
    ],
  };
};
