import { GraphType } from '~/generated/graphql';

export const getWidgetTitle = (graphType: GraphType, index: number): string => {
  const baseNames: Record<GraphType, string> = {
    [GraphType.AGGREGATE]: 'Number',
    [GraphType.GAUGE]: 'Gauge',
    [GraphType.PIE]: 'Pie Chart',
	[GraphType.WAFFLE]: 'Waffle Chart',
    [GraphType.VERTICAL_BAR]: 'Vertical Bar Chart',
    [GraphType.HORIZONTAL_BAR]: 'Horizontal Bar Chart',
    [GraphType.LINE]: 'Line Chart',
  };

  return `${baseNames[graphType] || 'Widget'} ${index + 1}`;
};
