import { type GraphWidgetConfiguration } from '@/page-layout/widgets/graph/types/GraphWidgetConfiguration';
import { type PageLayoutWidget, type WidgetType } from '~/generated/graphql';

export type GraphWidget = PageLayoutWidget & {
  type: WidgetType.GRAPH;
  configuration: GraphWidgetConfiguration;
};
