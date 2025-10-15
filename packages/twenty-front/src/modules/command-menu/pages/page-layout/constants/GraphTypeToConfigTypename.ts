import { GraphType } from '~/generated-metadata/graphql';

export const GRAPH_TYPE_TO_CONFIG_TYPENAME = {
  [GraphType.VERTICAL_BAR]: 'BarChartConfiguration',
  [GraphType.HORIZONTAL_BAR]: 'BarChartConfiguration',
  [GraphType.LINE]: 'LineChartConfiguration',
  [GraphType.PIE]: 'PieChartConfiguration',
  [GraphType.NUMBER]: 'NumberChartConfiguration',
  [GraphType.GAUGE]: 'GaugeChartConfiguration',
} as const;
