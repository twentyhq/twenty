import { type GraphType } from '@/page-layout/mocks/mockWidgets';
import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { type WidgetType } from '~/generated/graphql';

export type GraphWidget = PageLayoutWidgetWithData & {
  type: WidgetType.GRAPH;
  configuration: {
    graphType: GraphType;
  };
};
