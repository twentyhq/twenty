import { type GraphType } from '@/page-layout/mocks/mockWidgets';
import { type PageLayoutWidget, type WidgetType } from '~/generated/graphql';

export type GraphWidget = PageLayoutWidget & {
  type: WidgetType.GRAPH;
  configuration: {
    graphType: GraphType;
  };
};
