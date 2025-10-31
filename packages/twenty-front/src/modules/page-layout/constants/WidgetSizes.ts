import { GraphType } from '~/generated-metadata/graphql';

type WidgetSizeConfig = {
  default: { w: number; h: number };
  minimum: { w: number; h: number };
};

export const WIDGET_SIZES: Record<GraphType, WidgetSizeConfig> = {
  [GraphType.AGGREGATE]: {
    default: { w: 2, h: 2 },
    minimum: { w: 2, h: 2 },
  },
  [GraphType.GAUGE]: {
    default: { w: 3, h: 4 },
    minimum: { w: 3, h: 4 },
  },
  [GraphType.PIE]: {
    default: { w: 4, h: 4 },
    minimum: { w: 3, h: 4 },
  },
  [GraphType.VERTICAL_BAR]: {
    default: { w: 6, h: 6 },
    minimum: { w: 4, h: 4 },
  },
  [GraphType.HORIZONTAL_BAR]: {
    default: { w: 6, h: 6 },
    minimum: { w: 4, h: 4 },
  },
  [GraphType.LINE]: {
    default: { w: 6, h: 10 },
    minimum: { w: 4, h: 4 },
  },
};
