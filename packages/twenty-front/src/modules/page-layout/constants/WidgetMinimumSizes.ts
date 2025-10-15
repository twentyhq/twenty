import { GraphType } from '~/generated/graphql';

export const WIDGET_MINIMUM_SIZES = {
  DEFAULT: {
    minW: 2,
    minH: 2,
  },
  GRAPH: {
    [GraphType.VERTICAL_BAR]: {
      minW: 5,
      minH: 5,
    },
    [GraphType.HORIZONTAL_BAR]: {
      minW: 5,
      minH: 5,
    },
    [GraphType.LINE]: {
      minW: 5,
      minH: 5,
    },
    [GraphType.PIE]: {
      minW: 3,
      minH: 4,
    },
    [GraphType.GAUGE]: {
      minW: 3,
      minH: 4,
    },
    [GraphType.NUMBER]: {
      minW: 2,
      minH: 2,
    },
  },
} as const;
