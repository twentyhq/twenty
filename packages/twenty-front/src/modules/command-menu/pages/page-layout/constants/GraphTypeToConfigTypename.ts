import { GraphType } from '~/generated-metadata/graphql';

export const GRAPH_TYPE_TO_CONFIG_TYPENAME: Record<
  GraphType,
  | 'BarChartConfiguration'
  | 'LineChartConfiguration'
  | 'PieChartConfiguration'
  | 'NumberChartConfiguration'
  | 'GaugeChartConfiguration'
> = {
  [GraphType.BAR]: 'BarChartConfiguration',
  [GraphType.LINE]: 'LineChartConfiguration',
  [GraphType.PIE]: 'PieChartConfiguration',
  [GraphType.NUMBER]: 'NumberChartConfiguration',
  [GraphType.GAUGE]: 'GaugeChartConfiguration',
};
