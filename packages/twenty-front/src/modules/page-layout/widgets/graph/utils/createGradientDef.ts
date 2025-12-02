import { type GraphColorScheme } from '../types/GraphColorScheme';
import { calculateAngularGradient } from './calculateAngularGradient';

//TODO: Remove this util from gauge chart since gradient is no longer used
export const createGradientDef = (
  colorScheme: GraphColorScheme,
  id: string,
  isHovered: boolean = false,
  angle?: number,
  reverseGradient: boolean = false,
) => {
  const colors = isHovered
    ? colorScheme.gradient.hover
    : colorScheme.gradient.normal;

  const coords =
    angle !== undefined
      ? calculateAngularGradient(angle)
      : { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };

  return {
    id,
    type: 'linearGradient' as const,
    ...coords,
    colors: reverseGradient
      ? [
          { offset: 0, color: colors[1] },
          { offset: 100, color: colors[0] },
        ]
      : [
          { offset: 0, color: colors[0] },
          { offset: 100, color: colors[1] },
        ],
  };
};
