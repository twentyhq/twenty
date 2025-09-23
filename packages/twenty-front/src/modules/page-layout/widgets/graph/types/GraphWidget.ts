import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { type GraphWidgetConfiguration } from '@/page-layout/widgets/graph/types/GraphWidgetConfiguration';
import { type WidgetType } from '~/generated/graphql';

export type GraphWidget = PageLayoutWidgetWithData & {
  type: WidgetType.GRAPH;
  configuration: GraphWidgetConfiguration;
};
