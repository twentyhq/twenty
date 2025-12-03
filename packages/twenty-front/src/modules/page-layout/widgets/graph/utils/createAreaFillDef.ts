import { type GraphColorScheme } from '../types/GraphColorScheme';

const AREA_FILL_START_OPACITY = 0.14;
const AREA_FILL_END_OPACITY = 0;

export const createAreaFillDef = (
  colorScheme: GraphColorScheme,
  id: string,
) => {
  return {
    id,
    type: 'linearGradient' as const,
    x1: '0%',
    y1: '0%',
    x2: '0%',
    y2: '100%',
    colors: [
      { offset: 0, color: colorScheme.solid, opacity: AREA_FILL_START_OPACITY },
      { offset: 100, color: colorScheme.solid, opacity: AREA_FILL_END_OPACITY },
    ],
  };
};
